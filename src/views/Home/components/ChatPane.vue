<script setup lang="ts">
import { scrollToBottom } from "@/utils/scroll";
import { nextTick, onMounted, onUnmounted, watch } from "vue";
import { chatbotMessage } from "@/store/index";
import ChatHistory from "./ChatHistory.vue";

const store = chatbotMessage();
const BOTTOM_OFFSET = 40;

// 监听信息数组的变化，往下滑
watch(
  () => store.messages, // 监听消息数组
  async () => {
    // console.log("userScrolled的值", store.userScrolled);
    if (store.userScrolled) return;
    await nextTick();
    scrollToBottom();
  },
  { deep: true }, // 必须加 deep 才能监听数组内部变化
);

// dom挂载后，为元素的滚动事件添加监听器
watch(
  () => store.prohibit,
  async (prohibit) => {
    if (prohibit || store.userScrolled) return;
    await nextTick();
    scrollToBottom();
  },
);

onMounted(() => {
  const chatPane = document.querySelector(".chat-pane");
  chatPane?.addEventListener("scroll", throttleScroll);
});

function handleScroll() {
  const chatPane = document.querySelector(".chat-pane");
  if (!chatPane) return;

  const distanceToBottom =
    chatPane.scrollHeight - chatPane.scrollTop - chatPane.clientHeight;

  store.userScrolled = distanceToBottom > BOTTOM_OFFSET;
}

// 节流函数
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

// 卸载监听器
onUnmounted(() => {
  const chatPane = document.querySelector(".chat-pane");
  chatPane?.removeEventListener("scroll", throttleScroll);
});
</script>

<template>
  <div class="chat-pane">
    <!-- <SystemAvatar /> -->
    <!-- <SmartSuggestions /> -->
    <ChatHistory />
  </div>
</template>

<style scoped lang="less">
.chat-pane {
  background-color: white;
  flex: 1;
  margin-top: 70px;
  // margin-bottom: 120px;
  margin-bottom: 100px;
  height: 557px;
  overflow-y: auto;
  // border: 2px solid red;
}
</style>
