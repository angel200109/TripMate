<script setup lang="ts">
import { chatbotMessage } from "@/store/index";
import { storeToRefs } from "pinia";
import { marked } from "marked";

import ProductShowcase from "./ProductShowcase.vue";
import TrainTicket from "@/views/Home/components/TrainTicket.vue";
import CityWeather from "@/views/Home/components/CityWeather.vue";
import { Image as VanImage } from "vant";
import { ImageContent, TextContent } from "@/types";

// Markdown 文本转成 HTML
marked.setOptions({
  breaks: true,
  gfm: true,
});
const store = chatbotMessage();
const { messages } = storeToRefs(store);
</script>

<template>
  <div class="chat-history">
    <!-- 初始提示 -->
    <div v-if="messages.length === 0" class="welcome-tip">
      今天有什么可以帮到你？
    </div>
    <div v-for="(message, index) in messages" :key="index" class="message-item">
      <!-- 用户提问 -->
      <div class="send-text user-question" v-if="message.role === 'user'">
        <p v-if="Array.isArray(message.content)">
          {{ (message.content[0] as TextContent).text }}
        </p>
        <p v-else>{{ message.content }}</p>
      </div>
      <div
        class="send-image"
        v-if="message.role === 'user' && Array.isArray(message.content)"
      >
        <van-image
          width="120"
          height="120"
          radius="5"
          fit="cover"
          :src="(message.content[1] as ImageContent).image_url.url"
        />
      </div>
      <!-- 大模型回复 -->
      <div class="send-text ai-response" v-if="message.role === 'assistant'">
        <!-- 当 message.content 为空时显示 Loading -->
        <van-loading v-if="message.progress" size="0.6rem" />
        <!-- 否则渲染 Markdown -->
        <div v-else v-html="marked(message.content as string)"></div>
      </div>

      <TrainTicket
        v-if="
          message.role == 'assistant' &&
          message.functionName == 'get_train_tickets'
        "
        :data="message.toolData"
      />
      <CityWeather
        v-else-if="
          message.role == 'assistant' && message.functionName == 'get_weather'
        "
        :weatherData="message.toolData"
      />
      <ProductShowcase
        v-else-if="
          message.role == 'assistant' &&
          message.searchGoodsData &&
          message.searchGoodsData.length > 0
        "
        :searchGoodsData="message.searchGoodsData"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.chat-history {
  // display: flex;
  // flex-direction: column;
  height: 100%;
  margin-left: 30px;
  margin-right: 30px;
}

.message-item {
  display: flex;
  flex-direction: column;
}

.send-text {
  // max-width: 80%;
  font-size: 16px;
  color: #333;
  padding: 8px 11px;
  border-radius: 15px;
  margin-bottom: 15px;
  line-height: 1.4;
  min-height: 20px;
}
.user-question {
  align-self: flex-end;
  background-color: #edf3fe;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.2s ease-in-out forwards;
}
@keyframes fadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.ai-response {
  align-self: center;
  margin-left: 0;
  background-color: white;
  border-radius: 0;
  padding: 0;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}
.send-image {
  align-self: flex-end;
  margin-right: 10px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.2s ease-in-out forwards;
}

:deep(.chat ul) {
  padding-left: 23px;
}

.welcome-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: black;
  font-size: 20px;
  font-weight: 500;
}
</style>
