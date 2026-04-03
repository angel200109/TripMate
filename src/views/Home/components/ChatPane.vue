<script setup lang="ts">
import { scrollToBottom } from "@/utils/scroll";
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import { chatbotMessage } from "@/store/index";
import ChatHistory from "./ChatHistory.vue";

const store = chatbotMessage();
const BOTTOM_OFFSET = 40;

const getScrollContainer = () =>
  document.querySelector(".chat-history-scroller") as HTMLElement | null;

function handleScroll() {
  const chatPane = getScrollContainer();
  if (!chatPane) return;

  const distanceToBottom =
    chatPane.scrollHeight - chatPane.scrollTop - chatPane.clientHeight;

  store.userScrolled = distanceToBottom > BOTTOM_OFFSET;
}

function throttle(func: () => void, delay: number) {
  let lastCall = 0;
  return () => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func();
    }
  };
}

const throttleScroll = throttle(handleScroll, 50);

const bindScrollListener = () => {
  const chatPane = getScrollContainer();
  chatPane?.removeEventListener("scroll", throttleScroll);
  chatPane?.addEventListener("scroll", throttleScroll);
};

watch(
  () => store.messages,
  async () => {
    await nextTick();
    bindScrollListener();

    if (store.userScrolled) return;
    scrollToBottom();
  },
  { deep: true },
);

watch(
  () => store.prohibit,
  async (prohibit) => {
    if (prohibit || store.userScrolled) return;
    await nextTick();
    scrollToBottom();
  },
);

onMounted(async () => {
  await nextTick();
  bindScrollListener();
});

onUnmounted(() => {
  const chatPane = getScrollContainer();
  chatPane?.removeEventListener("scroll", throttleScroll);
});
</script>

<template>
  <div class="chat-pane">
    <ChatHistory />
  </div>
</template>

<style scoped lang="less">
.chat-pane {
  background-color: white;
  flex: 1;
  margin-top: 70px;
  margin-bottom: 100px;
  height: 557px;
  overflow: hidden;
}
</style>
