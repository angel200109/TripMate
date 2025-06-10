<script setup lang="ts">
import { chatbotMessage } from "@/store/index";
import { storeToRefs } from "pinia";
import { marked } from "marked";
import TrainTicket from "@/views/components/TrainTicket.vue";
import CityWeather from "@/views/components/CityWeather.vue";

marked.setOptions({
  breaks: true,
  gfm: true,
});
const store = chatbotMessage();
const { messages } = storeToRefs(store);
</script>

<template>
  <div class="ChatHistory" v-for="message in messages">
    <div
      class="chat"
      :class="{
        AiResponse: message.role === 'assistant',
        userQuestion: message.role === 'user',
      }"
      v-html="marked(message.content as string)"
    ></div>
    <TrainTicket
      v-if="
        message.role == 'assistant' &&
        message.functionName == 'get_train_tickets'
      "
      :data="message.toolData"
    />
    <CityWeather
      v-if="
        message.role == 'assistant' && message.functionName == 'get_weather'
      "
      :weatherData="message.toolData"
    />
  </div>
</template>

<style scoped>
.test {
  max-width: 80%;
  background-color: aquamarine;
  height: 40px;
  line-height: 40px;
  font-size: 16px;
}
.ChatHistory {
  display: flex;
  flex-direction: column;
}
.chat {
  max-width: 80%;
  font-size: 16px;
  color: #333;
  padding: 8px 11px;
  border-radius: 10px;
  margin-bottom: 15px;
  line-height: 1.4;
  min-height: 20px;
}
:deep(.chat ul) {
  padding-left: 23px;
}
/* :deep(.chat ul) {
  list-style: none;
}
:deep(li) {
  position: relative;
  padding-left: 1.5em;
}

:deep(li::before) {
  content: "🌟"; 
  position: absolute;
  left: 0;
  top: 0;
  color: orange;
  font-size: 1em;
} */
.userQuestion {
  align-self: flex-end;
  margin-right: 10px;
  background-color: #d0e2f2;
}
.AiResponse {
  align-self: flex-start;
  margin-left: 10px;
  background-color: #f0efef;
}
</style>
