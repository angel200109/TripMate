<script setup lang="ts">
import { storeToRefs } from "pinia";
import { chatbotMessage } from "@/store";
import HeaderNav from "./components/HeaderNav.vue";
import ChatPane from "./components/ChatPane.vue";
import ChatInputBar from "./components/ChatInputBar.vue";
import ConversationSidebar from "./components/ConversationSidebar.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const store = chatbotMessage();
const { conversations, currentConversationId } = storeToRefs(store);
const showConversationSidebar = ref(false);
const route = useRoute();
const router = useRouter();

const handleCreateConversation = () => {
  store.startNewConversation();
  showConversationSidebar.value = false;
  router.push("/");
};

const handleSelectConversation = (id: string) => {
  router.push(`/chat/${id}`);
};

onMounted(async () => {
  await store.loadConversations();
});

watch(
  () => route.params.id,
  async (id) => {
    await store.syncConversationByRoute(typeof id === "string" ? id : undefined);
  },
  { immediate: true }
);
</script>

<template>
  <div class="home">
    <HeaderNav
      text="问一问"
      @open-sidebar="showConversationSidebar = true"
      @create="handleCreateConversation"
    />
    <ChatPane />
    <ChatInputBar />
    <ConversationSidebar
      v-model:show="showConversationSidebar"
      :conversations="conversations"
      :active-id="currentConversationId"
      @create="handleCreateConversation"
      @select="handleSelectConversation"
    />
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
