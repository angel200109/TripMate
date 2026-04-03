import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import { perfTracker } from "@/utils/perf";

// 对插入到 HTML 模板中的文本做转义，避免语言名等动态内容破坏结构。
const escapeHtml = (content: string) =>
  content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// 统一包装代码块结构，额外插入头部用于显示代码语言。
const wrapCodeBlock = (code: string, lang: string) => {
  const language = lang || "text";
  return `<div class="hl-code"><div class="hl-code-header"><span>${escapeHtml(language)}</span></div><div class="hljs"><code>${code}</code></div></div>`;
};

// 创建 markdown-it 实例，负责基础 Markdown 转 HTML。
const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  highlight(str, lang) {
    // 如果识别到语言，则交给 highlight.js 做语法高亮。
    if (lang && hljs.getLanguage(lang)) {
      try {
        return wrapCodeBlock(
          hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true,
          }).value,
          lang,
        );
      } catch (error) {
        console.error("markdown highlight error:", error);
      }
    }

    // 无法识别语言时，回退为纯文本代码块展示。
    return wrapCodeBlock(escapeHtml(str), lang);
  },
});

// 挂载数学公式插件，支持 $...$ 和 $$...$$ 语法。
md.use(texmath, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: {
    throwOnError: false,
    strict: "ignore",
  },
});

// 给 Markdown 中的链接补充安全属性，避免新窗口链接带来安全问题。
const afterSanitizeAttributes = (node: Element) => {
  if (node.tagName?.toLowerCase() !== "a") {
    return;
  }

  node.setAttribute("rel", "noopener noreferrer nofollow");
  node.setAttribute("target", "_blank");
};

// 统一执行 Markdown 渲染，并在输出前做 XSS 安全清洗。
export const renderMarkdown = (content: string) => {
  const start = performance.now();
  const rawHtml = md.render(content ?? "");

  DOMPurify.addHook("afterSanitizeAttributes", afterSanitizeAttributes);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true, mathMl: true },
  });
  DOMPurify.removeHook("afterSanitizeAttributes");

  perfTracker.recordMarkdownRender(
    performance.now() - start,
    content?.length ?? 0,
    sanitizedHtml.length,
  );

  return sanitizedHtml;
};
