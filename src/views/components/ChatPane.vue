<script setup lang="ts">
import SystemAvatar from "@/views/components/SystemAvatar.vue";
import SmartSuggestions from "@/views/components/SmartSuggestions.vue";
import ChatHistory from "@/views/components/ChatHistory.vue";
import TrainTicket from "./TrainTicket.vue";
import { scrollToBottom } from "@/utils/scroll";

import { watch } from "vue";
import { chatbotMessage } from "@/store/index";

const store = chatbotMessage();

watch(
  () => store.messages, // 监听消息数组
  (newVal, oldVal) => {
    scrollToBottom(); // 在此触发你想执行的逻辑，比如滚动
  },
  { deep: true } // 必须加 deep 才能监听数组内部变化
);
</script>

<template>
  <div class="chat-pane">
    <SystemAvatar />
    <SmartSuggestions />
    <ChatHistory />
    <TrainTicket />
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
  margin-bottom: 100px;
  height: 557px;
  overflow-y: auto;
  // border: 2px solid red;
}
</style>
