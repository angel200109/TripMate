export function scrollToBottom(selector = ".chat-pane") {
  const container = document.querySelector(selector);
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
}
