<script setup>
import HeaderNav from "./components/HeaderNav.vue";
import ChatPane from "./components/ChatPane.vue";
import ChatInputBar from "./components/ChatInputBar.vue";
</script>

<template>
  <div class="home">
    <HeaderNav />
    <ChatPane />
    <ChatInputBar />
  </div>
</template>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
