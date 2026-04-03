import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import { h, type VNodeChild } from "vue";
import { perfTracker } from "@/utils/perf";

type MarkdownToken = ReturnType<MarkdownIt["parse"]>[number];

// markdown-it 只负责把 Markdown 解析为 token，不直接把整段结果注入页面。
const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
});

// 继续复用现有数学公式能力，公式仍由 KaTeX 负责生成可展示结构。
md.use(texmath, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: {
    throwOnError: false,
    strict: "ignore",
  },
});

// 高亮失败或需要手动构造 HTML 片段时，对原始文本做基础转义。
const escapeHtml = (content: string) =>
  content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// 链接统一补充安全属性，避免新窗口跳转带来的安全问题。
const afterSanitizeAttributes = (node: Element) => {
  if (node.tagName?.toLowerCase() !== "a") {
    return;
  }

  node.setAttribute("rel", "noopener noreferrer nofollow");
  node.setAttribute("target", "_blank");
};

// 对第三方生成的 HTML 片段做净化。
// 当前主要用于 highlight.js 和 KaTeX 的输出，而不是渲染用户原始 HTML。
const sanitizeTrustedHtml = (html: string) => {
  DOMPurify.addHook("afterSanitizeAttributes", afterSanitizeAttributes);
  const sanitizedHtml = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, mathMl: true },
  });
  DOMPurify.removeHook("afterSanitizeAttributes");
  return sanitizedHtml;
};

// 把内联 style 字符串转成 Vue 可接收的样式对象。
const styleTextToObject = (styleText: string) =>
  styleText
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const separatorIndex = item.indexOf(":");
      if (separatorIndex === -1) {
        return acc;
      }

      const name = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();

      if (name && value) {
        acc[name] = value;
      }

      return acc;
    }, {});

// 某些第三方库只能先产出 HTML 字符串，这里把经过净化的 HTML 片段再转成 VNode。
// 这样可以避免直接使用 v-html，同时仍保留高亮和公式渲染能力。
const fragmentHtmlToVNodes = (html: string, keyPrefix: string): VNodeChild[] => {
  if (!html) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");

  const visitNode = (node: Node, key: string): VNodeChild => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as Element;
    const props: Record<string, unknown> = { key };

    for (const attr of Array.from(element.attributes)) {
      if (attr.name === "style") {
        props.style = styleTextToObject(attr.value);
        continue;
      }

      props[attr.name] = attr.value;
    }

    const children = Array.from(element.childNodes).map((child, index) =>
      visitNode(child, `${key}-${index}`),
    );

    return h(element.tagName.toLowerCase(), props, children);
  };

  return Array.from(doc.body.childNodes).map((node, index) =>
    visitNode(node, `${keyPrefix}-${index}`),
  );
};

// 对链接和图片地址做协议白名单控制，拦截 javascript: 等危险协议。
const safeUrl = (value: string | null | undefined, kind: "href" | "src") => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed, window.location.origin);
    const allowedProtocols =
      kind === "href"
        ? new Set(["http:", "https:", "mailto:", "tel:"])
        : new Set(["http:", "https:", "data:", "blob:"]);

    return allowedProtocols.has(url.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
};

// 把 markdown-it token 上的 attrs 转成 VNode props，并在这里集中做链接安全处理。
const tokenAttrsToProps = (token: MarkdownToken, key: string) => {
  const props: Record<string, unknown> = { key };

  for (const [name, value] of token.attrs ?? []) {
    if (name === "href") {
      const href = safeUrl(value, "href");
      if (href) {
        props.href = href;
      }
      continue;
    }

    if (name === "src") {
      const src = safeUrl(value, "src");
      if (src) {
        props.src = src;
      }
      continue;
    }

    props[name] = value;
  }

  if (token.tag === "a") {
    props.rel = "noopener noreferrer nofollow";
    props.target = "_blank";
  }

  return props;
};

// markdown-it 的块级和行内节点通常以 xxx_open / xxx_close 成对出现。
// 这里根据起始 token 找到对应闭合 token，用于递归构造子树。
const findCloseTokenIndex = (tokens: MarkdownToken[], startIndex: number) => {
  const openToken = tokens[startIndex];
  const closeType = openToken.type.replace("_open", "_close");
  let depth = 1;

  for (let index = startIndex + 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === openToken.type) {
      depth += 1;
    } else if (token.type === closeType) {
      depth -= 1;
    }

    if (depth === 0) {
      return index;
    }
  }

  return startIndex;
};

// 代码块单独走一套渲染逻辑：
// 1. 先由 highlight.js 生成带样式的 HTML
// 2. 再净化并转成 VNode
// 3. 最后套上现有项目里的代码块容器样式
const renderHighlightedCode = (code: string, language: string, key: string) => {
  let highlightedCode = escapeHtml(code);

  if (language && hljs.getLanguage(language)) {
    try {
      highlightedCode = hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      }).value;
    } catch (error) {
      console.error("markdown highlight error:", error);
    }
  }

  const codeChildren = fragmentHtmlToVNodes(
    sanitizeTrustedHtml(highlightedCode),
    `${key}-code`,
  );

  return h("div", { key, class: "hl-code" }, [
    h("div", { class: "hl-code-header" }, [
      h("span", null, (language || "text").toLowerCase()),
    ]),
    // 这里保持与旧方案一致的 DOM 结构，避免 pre 元素默认 margin/white-space
    // 影响现有代码块样式与布局表现。
    h("div", { class: "hljs" }, [h("code", null, codeChildren)]),
  ]);
};

// 数学公式与代码高亮类似，先交给 KaTeX 生成 HTML，再净化后转成 VNode。
// 行内公式和块级公式最终会映射成不同的结构。
const renderMath = (
  content: string,
  displayMode: boolean,
  key: string,
  eqno?: string,
) => {
  let html = "";

  try {
    html = katex.renderToString(content, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
    });
  } catch (error) {
    console.error("markdown katex error:", error);
    html = escapeHtml(content);
  }

  const mathChildren = fragmentHtmlToVNodes(
    sanitizeTrustedHtml(html),
    `${key}-math`,
  );

  if (!displayMode) {
    return h("eq", { key }, mathChildren);
  }

  const children: VNodeChild[] = [h("eqn", null, mathChildren)];
  if (eqno) {
    children.push(h("span", null, `(${eqno})`));
  }

  return h(
    "section",
    { key, class: eqno ? "eqno" : undefined },
    children,
  );
};

// 递归渲染行内 token。
// 这里主要处理文本、换行、行内代码、图片、链接和行内公式。
const renderInlineTokens = (tokens: MarkdownToken[], parentKey: string): VNodeChild[] => {
  const nodes: VNodeChild[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const key = `${parentKey}-${index}`;

    if (token.hidden) {
      continue;
    }

    if (token.type === "text") {
      nodes.push(token.content);
      continue;
    }

    if (token.type === "softbreak" || token.type === "hardbreak") {
      nodes.push(h("br", { key }));
      continue;
    }

    if (token.type === "code_inline") {
      nodes.push(h("code", { key }, token.content));
      continue;
    }

    if (token.type === "image") {
      const props = tokenAttrsToProps(token, key);
      if (!props.src) {
        continue;
      }
      props.alt = token.content;
      nodes.push(h("img", props));
      continue;
    }

    if (token.type === "math_inline") {
      nodes.push(renderMath(token.content, false, key));
      continue;
    }

    if (token.type === "math_inline_double") {
      nodes.push(renderMath(token.content, true, key));
      continue;
    }

    if (token.type === "html_inline") {
      nodes.push(token.content);
      continue;
    }

    if (token.nesting === 1 && token.tag) {
      const closeIndex = findCloseTokenIndex(tokens, index);
      const innerTokens = tokens.slice(index + 1, closeIndex);
      const children = renderInlineTokens(innerTokens, key);

      nodes.push(h(token.tag, tokenAttrsToProps(token, key), children));
      index = closeIndex;
    }
  }

  return nodes;
};

// 递归渲染块级 token。
// 当前支持段落、标题、列表、表格、引用、代码块、分割线和块级公式等常见结构。
const renderBlockTokens = (tokens: MarkdownToken[], parentKey: string): VNodeChild[] => {
  const nodes: VNodeChild[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const key = `${parentKey}-${index}`;

    if (token.hidden) {
      continue;
    }

    if (token.type === "inline") {
      nodes.push(...renderInlineTokens(token.children ?? [], `${key}-inline`));
      continue;
    }

    if (token.type === "fence") {
      const language = token.info.trim().split(/\s+/)[0] ?? "";

      // 兼容 ```math ... ``` 写法，这类 fenced block 应按公式而不是代码块渲染。
      if (language === "math") {
        nodes.push(renderMath(token.content.trim(), true, key));
        continue;
      }

      nodes.push(renderHighlightedCode(token.content, language, key));
      continue;
    }

    if (token.type === "code_block") {
      const language = token.info.trim().split(/\s+/)[0] ?? "";
      nodes.push(renderHighlightedCode(token.content, language, key));
      continue;
    }

    if (token.type === "hr") {
      nodes.push(h("hr", { key }));
      continue;
    }

    if (token.type === "math_block") {
      nodes.push(renderMath(token.content, true, key));
      continue;
    }

    if (token.type === "math_block_eqno") {
      nodes.push(renderMath(token.content, true, key, token.info));
      continue;
    }

    if (token.nesting === 1 && token.tag) {
      const closeIndex = findCloseTokenIndex(tokens, index);
      const innerTokens = tokens.slice(index + 1, closeIndex);
      const children = renderBlockTokens(innerTokens, key);

      if (token.hidden) {
        nodes.push(...children);
      } else {
        nodes.push(h(token.tag, tokenAttrsToProps(token, key), children));
      }

      index = closeIndex;
    }
  }

  return nodes;
};

// 对外暴露的统一入口：
// 1. 解析全文 Markdown 为 token
// 2. 将 token 树递归转换为 VNode
// 3. 记录本次渲染耗时，便于和旧方案做性能对比
//
// 注意：当前实现虽然去掉了 v-html，但仍然是“全文 parse + 全量生成 VNode”。
// 如果要进一步优化流式输出性能，下一步应继续做块级缓存或尾部增量解析。
export const renderMarkdownToVNodes = (content: string) => {
  const start = performance.now();
  const tokens = md.parse(content ?? "", {});
  const nodes = renderBlockTokens(tokens, "md");

  perfTracker.recordMarkdownRender(
    performance.now() - start,
    content?.length ?? 0,
    nodes.length,
  );

  return nodes;
};
