import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

const afterSanitizeAttributes = (node: Element) => {
  if (node.tagName?.toLowerCase() !== "a") {
    return;
  }

  node.setAttribute("rel", "noopener noreferrer nofollow");
  node.setAttribute("target", "_blank");
};

export const renderMarkdown = (content: string) => {
  const rawHtml = marked.parse(content) as string;

  DOMPurify.addHook("afterSanitizeAttributes", afterSanitizeAttributes);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
  DOMPurify.removeHook("afterSanitizeAttributes");

  return sanitizedHtml;
};
