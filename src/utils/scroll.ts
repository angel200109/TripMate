import { perfTracker } from "@/utils/perf";

let pendingFrameId: number | null = null;
let pendingSelector = ".chat-history-scroller";

export function scrollToBottom(selector = ".chat-history-scroller") {
  pendingSelector = selector;

  if (pendingFrameId !== null) {
    return;
  }

  pendingFrameId = window.requestAnimationFrame(() => {
    pendingFrameId = null;

    const container = document.querySelector(pendingSelector);
    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    if (maxScrollTop <= 0) {
      return;
    }

    container.scrollTo({
      top: maxScrollTop,
      behavior: "auto",
    });
    perfTracker.recordScroll();
    console.log("已滑到底部");
  });
}
