<script setup lang="ts">
import { chatbotMessage } from "@/store/index";
import { showToast } from "vant";
import ProductShowcase from "./ProductShowcase.vue";
import TrainTicket from "@/views/Home/components/TrainTicket.vue";
import CityWeather from "@/views/Home/components/CityWeather.vue";
import { Image as VanImage } from "vant";
import type { ChatMessage, ImageContent, TextContent } from "@/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  isLast: boolean;
}>();

const store = chatbotMessage();

const copyMessage = async (content: string) => {
  if (!content) return;

  try {
    await navigator.clipboard.writeText(content);
    showToast({ message: "已复制", duration: 1000 });
  } catch (error) {
    console.error("复制失败:", error);
    showToast({ message: "复制失败", duration: 1000 });
  }
};

const getUserText = (content: string | Array<TextContent | ImageContent>) => {
  return Array.isArray(content)
    ? ((content[0] as TextContent).text as string)
    : content;
};

const rewriteMessage = (
  content: string | Array<TextContent | ImageContent>,
) => {
  store.draftInput = getUserText(content);
};

const regenerateMessage = async () => {
  try {
    await store.regenerateLastAnswer();
  } catch (error) {
    console.error("重新生成失败:", error);
    showToast({ message: "重新生成失败", duration: 1000 });
  }
};
</script>

<template>
  <div class="message-item">
    <div v-if="message.role === 'user'" class="send-text user-question">
      <p v-if="Array.isArray(message.content)">
        {{ (message.content[0] as TextContent).text }}
      </p>
      <p v-else>{{ message.content }}</p>
    </div>
    <div v-if="message.role === 'user'" class="user-actions">
      <button
        class="user-copy-btn"
        type="button"
        @click="copyMessage(getUserText(message.content))"
        aria-label="复制提问"
        title="复制提问"
      >
        <svg
          t="1774093368511"
          class="copy-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1672"
        >
          <path
            d="M554.666667 320H256a138.666667 138.666667 0 0 0-138.666667 138.666667v298.666666A138.666667 138.666667 0 0 0 256 896h298.666667a138.666667 138.666667 0 0 0 138.666666-138.666667v-298.666666A138.666667 138.666667 0 0 0 554.666667 320zM256 384h298.666667c41.216 0 74.666667 33.450667 74.666666 74.666667v298.666666A74.666667 74.666667 0 0 1 554.666667 832H256a74.666667 74.666667 0 0 1-74.666667-74.666667v-298.666666C181.333333 417.450667 214.784 384 256 384z"
            fill="#8a8a8a"
            p-id="1673"
          ></path>
          <path
            d="M768 128a138.666667 138.666667 0 0 1 138.453333 130.816l0.213334 7.850667v298.666666A138.666667 138.666667 0 0 1 768 704a32 32 0 0 1-4.352-63.701333L768 640a74.666667 74.666667 0 0 0 74.410667-68.522667l0.256-6.144v-298.666666a74.666667 74.666667 0 0 0-68.522667-74.410667L768 192h-298.666667a74.666667 74.666667 0 0 0-74.666666 74.666667 32 32 0 0 1-64 0 138.666667 138.666667 0 0 1 130.816-138.453334L469.333333 128h298.666667z"
            fill="#8a8a8a"
            p-id="1674"
          ></path>
        </svg>
      </button>
      <button
        class="user-rewrite-btn"
        type="button"
        @click="rewriteMessage(message.content)"
        aria-label="重写提问"
        title="重写提问"
      >
        <svg
          t="1774094394387"
          class="copy-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6693"
        >
          <path
            d="M421.6832 345.4976c6.5536 0 13.1072-2.5088 18.1248-7.4752l13.568-13.568a25.61536 25.61536 0 0 0 0-36.1984 25.61536 25.61536 0 0 0-36.1984 0l-13.568 13.568a25.61536 25.61536 0 0 0 0 36.1984c4.9664 4.9664 11.52 7.4752 18.0736 7.4752z"
            fill="#8a8a8a"
            p-id="6694"
          ></path>
          <path
            d="M866.1504 236.0832l-107.9296-107.9296c-24.1664-24.1664-56.32-37.4784-90.5216-37.4784s-66.3552 13.312-90.5216 37.4784l-0.0512 0.0512-0.0512 0.0512-0.256 0.256-67.7888 67.84c-1.1776 1.1776-2.2016 2.4576-3.1232 3.7888l-39.3216 39.68a25.61536 25.61536 0 0 0 0.1536 36.1984 25.61536 25.61536 0 0 0 36.1984-0.1536l24.3712-24.576c66.3552 67.7376 148.7872 151.9104 213.8624 218.4192l-349.952 349.952a66.6624 66.6624 0 0 1-46.848 19.4048h-0.256l-202.8544-0.8704c-0.8704 0-1.5872-0.3072-2.1504-0.9216a2.9184 2.9184 0 0 1-0.768-2.2016l14.1312-187.136c1.1776-15.7696 8.0384-30.6688 19.2512-41.8816l216.7296-217.344a25.56928 25.56928 0 0 0-0.0512-36.1984 25.56928 25.56928 0 0 0-36.1984 0.0512L135.5264 569.856a117.31456 117.31456 0 0 0-34.048 74.1888l-14.1312 187.136c-1.1264 14.9504 4.0448 29.7984 14.1824 40.8064 10.1376 11.008 24.576 17.3568 39.5264 17.408l202.8544 0.8704h0.4608c30.9248 0 61.184-12.544 83.0464-34.4064l438.7328-438.6816c49.92-49.9712 49.92-131.1744 0-181.0944z m-88.7296 197.376c-65.1776-66.6112-147.712-150.9376-214.016-218.5728l50.0224-50.4832c29.952-29.952 78.6944-29.952 108.5952 0l107.9296 107.9296c29.952 29.952 29.952 78.6432 0 108.5952l-52.5312 52.5312zM902.6048 838.0416H505.088c-14.1312 0-25.6 11.4688-25.6 25.6s11.4688 25.6 25.6 25.6h397.4656c14.1312 0 25.6-11.4688 25.6-25.6s-11.4176-25.6-25.5488-25.6z"
            fill="#8a8a8a"
            p-id="6695"
          ></path>
        </svg>
      </button>
    </div>
    <div v-if="message.role === 'user' && Array.isArray(message.content)" class="send-image">
      <van-image
        width="120"
        height="120"
        radius="5"
        fit="cover"
        :src="(message.content[1] as ImageContent).image_url.url"
      />
    </div>

    <div v-if="message.role === 'assistant'" class="send-text ai-response">
      <van-loading v-if="message.progress" size="0.6rem" />
      <MarkdownRenderer v-else :content="message.content as string" />
      <button
        v-if="!message.progress && !store.prohibit && message.content && isLast"
        class="copy-btn"
        type="button"
        @click="copyMessage(message.content as string)"
        aria-label="复制回复"
        title="复制回复"
      >
        <svg
          t="1774093368511"
          class="copy-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1672"
        >
          <path
            d="M554.666667 320H256a138.666667 138.666667 0 0 0-138.666667 138.666667v298.666666A138.666667 138.666667 0 0 0 256 896h298.666667a138.666667 138.666667 0 0 0 138.666666-138.666667v-298.666666A138.666667 138.666667 0 0 0 554.666667 320zM256 384h298.666667c41.216 0 74.666667 33.450667 74.666666 74.666667v298.666666A74.666667 74.666667 0 0 1 554.666667 832H256a74.666667 74.666667 0 0 1-74.666667-74.666667v-298.666666C181.333333 417.450667 214.784 384 256 384z"
            fill="#8a8a8a"
            p-id="1673"
          ></path>
          <path
            d="M768 128a138.666667 138.666667 0 0 1 138.453333 130.816l0.213334 7.850667v298.666666A138.666667 138.666667 0 0 1 768 704a32 32 0 0 1-4.352-63.701333L768 640a74.666667 74.666667 0 0 0 74.410667-68.522667l0.256-6.144v-298.666666a74.666667 74.666667 0 0 0-68.522667-74.410667L768 192h-298.666667a74.666667 74.666667 0 0 0-74.666666 74.666667 32 32 0 0 1-64 0 138.666667 138.666667 0 0 1 130.816-138.453334L469.333333 128h298.666667z"
            fill="#8a8a8a"
            p-id="1674"
          ></path>
        </svg>
      </button>
      <button
        v-if="!message.progress && !store.prohibit && message.content && isLast"
        class="regen-btn"
        type="button"
        @click="regenerateMessage"
        aria-label="重新生成回复"
        title="重新生成回复"
      >
        <svg
          t="1774093633435"
          class="copy-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3611"
        >
          <path
            d="M865.133714 396.653714l-57.782857 16.237715c28.306286 110.006857-1.974857 228.352-79.067428 308.809142a297.179429 297.179429 0 0 1-432.566858 0 324.169143 324.169143 0 0 1-89.526857-225.645714c0-85.211429 31.817143-165.302857 89.526857-225.572571A298.130286 298.130286 0 0 1 591.579429 187.977143l-13.677715 52.882286 137.947429-51.346286L620.982857 73.142857l-13.897143 54.345143a352.768 352.768 0 0 0-186.660571-0.950857 363.008 363.008 0 0 0-167.058286 99.693714 381.44 381.44 0 0 0-80.457143 126.244572A394.459429 394.459429 0 0 0 146.285714 496.054857c0 49.590857 8.996571 97.865143 26.770286 143.652572a381.44 381.44 0 0 0 80.384 126.244571 363.300571 363.300571 0 0 0 120.978286 83.821714A350.939429 350.939429 0 0 0 512 877.714286c47.542857 0 93.696-9.362286 137.581714-27.940572a363.300571 363.300571 0 0 0 120.978286-83.821714 385.316571 385.316571 0 0 0 95.524571-174.372571 400.384 400.384 0 0 0-1.024-194.925715z"
            fill="#8a8a8a"
            p-id="3612"
          ></path>
        </svg>
      </button>
    </div>

    <TrainTicket
      v-if="
        message.role === 'assistant' &&
        message.functionName === 'get_train_tickets'
      "
      :data="message.toolData"
    />
    <CityWeather
      v-else-if="
        message.role === 'assistant' && message.functionName === 'get_weather'
      "
      :weatherData="message.toolData"
    />
    <ProductShowcase
      v-else-if="
        message.role === 'assistant' &&
        message.searchGoodsData &&
        message.searchGoodsData.length > 0
      "
      :searchGoodsData="message.searchGoodsData"
    />
  </div>
</template>

<style scoped lang="less">
.message-item {
  display: flex;
  flex-direction: column;
}

.send-text {
  font-size: 16px;
  color: #333;
  padding: 8px 11px;
  border-radius: 15px;
  margin-bottom: 3px;
  line-height: 1.4;
  min-height: 20px;
}

.user-question {
  align-self: flex-end;
  background-color: #edf3fe;
}

.user-actions {
  display: flex;
  align-self: flex-end;
  align-items: center;
}

.user-copy-btn,
.user-rewrite-btn,
.copy-btn,
.regen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
}

.user-copy-btn {
  margin-left: auto;
}

.user-rewrite-btn {
  margin-left: 6px;
}

.copy-btn {
  margin-top: 8px;
}

.regen-btn {
  margin-top: 8px;
  margin-right: 6px;
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

.copy-btn:active,
.copy-btn:hover,
.regen-btn:active,
.regen-btn:hover {
  background-color: transparent;
}

.copy-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.send-image {
  align-self: flex-end;
  margin-right: 10px;
}

:deep(.ai-response .markdown-body) {
  color: inherit;
  background-color: transparent;
  color-scheme: light;
  font-size: 16px;
  line-height: 1.75;
}

:deep(.ai-response .markdown-body > :first-child) {
  margin-top: 0;
}

:deep(.ai-response .markdown-body > :last-child) {
  margin-bottom: 0;
}

:deep(.ai-response p) {
  margin: 0 0 12px;
}

:deep(.ai-response .markdown-body h1),
:deep(.ai-response .markdown-body h2),
:deep(.ai-response .markdown-body h3),
:deep(.ai-response .markdown-body h4),
:deep(.ai-response .markdown-body h5),
:deep(.ai-response .markdown-body h6) {
  margin-top: 20px;
  margin-bottom: 12px;
}

:deep(.ai-response .markdown-body table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-spacing: 0;
  border-collapse: collapse;
  background-color: #ffffff;
  color: #24292f;
}

:deep(.ai-response .markdown-body th),
:deep(.ai-response .markdown-body td) {
  border: 1px solid #d0d7de;
  background-color: #ffffff;
  color: #24292f;
}

:deep(.ai-response .markdown-body th) {
  background-color: #f6f8fa;
}

:deep(.ai-response .markdown-body blockquote) {
  color: #5f6c7b;
  border-left-color: #d0d7de;
}

:deep(.ai-response p:last-child) {
  margin-bottom: 0;
}

:deep(.ai-response code) {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(.ai-response .hl-code) {
  margin: 12px 0;
  overflow: hidden;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background-color: #f8fafc;
}

:deep(.ai-response .hl-code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 14px;
  border-bottom: 1px solid #e3e8ef;
  background-color: #eef3f8;
  color: #51606f;
  font-size: 13px;
  font-weight: 600;
  text-transform: lowercase;
}

:deep(.ai-response .hljs) {
  overflow-x: auto;
  padding: 14px 16px;
  background-color: #f8fafc;
}

:deep(.ai-response .hljs code) {
  display: block;
  min-width: max-content;
  margin: 0;
  padding: 0;
  border-radius: 0;
  background: transparent !important;
  line-height: 1.6;
  white-space: pre;
}

:deep(.ai-response .katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  -webkit-overflow-scrolling: touch;
}

:deep(.ai-response .katex-display > .katex) {
  display: inline-block;
  min-width: max-content;
}
</style>
