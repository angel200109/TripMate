<script setup lang="ts">
import { computed } from "vue";
import { chatbotMessage } from "@/store/index";
import { storeToRefs } from "pinia";
import "github-markdown-css/github-markdown.css";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import ChatMessageItem from "./ChatMessageItem.vue";

const store = chatbotMessage();
const { messages } = storeToRefs(store);

const virtualMessages = computed(() =>
  messages.value.map((message, index) => ({
    id:
      message.id ||
      `${store.currentConversationId || "draft"}-${index}-${message.role}`,
    message,
    index,
  })),
);

const getSizeDependencies = (item: (typeof virtualMessages.value)[number]) => [
  item.message.role,
  item.message.progress,
  item.message.functionName,
  item.message.content,
  item.message.rawContent,
  item.message.toolData ? JSON.stringify(item.message.toolData) : "",
  item.message.searchGoodsData
    ? JSON.stringify(item.message.searchGoodsData)
    : "",
];
</script>

<template>
  <DynamicScroller
    v-if="virtualMessages.length > 0"
    class="chat-history-scroller"
    :items="virtualMessages"
    key-field="id"
    :min-item-size="96"
    :buffer="400"
    :prerender="8"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="getSizeDependencies(item)"
        :emit-resize="true"
      >
        <div class="chat-history-item">
          <ChatMessageItem
            :message="item.message"
            :index="item.index"
            :is-last="item.index === messages.length - 1"
          />
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <!-- <div
    v-if="virtualMessages.length > 0"
    class="chat-history-scroller chat-history-fallback"
  >
    <div
      v-for="(message, index) in messages"
      :key="
        message.id ||
        `${store.currentConversationId || 'draft'}-${index}-${message.role}`
      "
      class="chat-history-item"
    >
      <ChatMessageItem
        :message="message"
        :index="index"
        :is-last="index === messages.length - 1"
      />
    </div>
  </div> -->
  <div v-else class="welcome-tip">今天有什么可以帮到你？</div>
</template>

<style scoped lang="less">
.chat-history-scroller {
  height: 100%;
  padding: 0 30px;
}

.chat-history-fallback {
  overflow-y: auto;
}

.chat-history-item {
  width: 100%;
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
