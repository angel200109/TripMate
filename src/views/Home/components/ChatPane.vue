<script setup lang="ts">
import { scrollToBottom } from "@/utils/scroll";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { chatbotMessage } from "@/store/index";
import SystemAvatar from "./SystemAvatar.vue";
import SmartSuggestions from "./SmartSuggestions.vue";
import ChatHistory from "./ChatHistory.vue";

const store = chatbotMessage();
const lastScrollTop = ref(0);

// 监听信息数组的变化，往下滑
watch(
  () => store.messages, // 监听消息数组
  () => {
    console.log("userScrolled的值", store.userScrolled);
    if (store.userScrolled) return;
    scrollToBottom();
  },
  { deep: true } // 必须加 deep 才能监听数组内部变化
);

// dom挂载后，为元素的滚动事件添加监听器
onMounted(() => {
  const chatPane = document.querySelector(".chat-pane");
  chatPane?.addEventListener("scroll", throttleScroll);
});

function handleScroll() {
  const chatPane = document.querySelector(".chat-pane");
  const currentScroll = chatPane?.scrollTop;
  if (!currentScroll) return;
  if (currentScroll > lastScrollTop.value) {
  } else {
    console.log("用户往下滑了");
    store.userScrolled = true;
  }
  // console.log(currentScroll);
  lastScrollTop.value = currentScroll;
}

// 节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
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
    <SystemAvatar />
    <SmartSuggestions />
    <ChatHistory />
  </div>
</template>

<style scoped lang="less">
.chat-pane {
  background: linear-gradient(
    to bottom,
    #d0e8fa 0%,
    #d0e8fa 5%,
    #f7f8fa 25%,
    #f7f8fa 100%
  );
  flex: 1;
  margin-top: 50px;
  margin-bottom: 120px;
  padding-bottom: 30px;
  height: 557px;
  overflow-y: auto;
  // border: 2px solid red;
}
</style>
