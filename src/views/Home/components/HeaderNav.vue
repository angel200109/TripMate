<script setup lang="ts">
defineProps<{ text: string }>();

const emit = defineEmits<{
  (e: "open-sidebar"): void;
  (e: "create"): void;
}>();
</script>

<template>
  <div class="header-nav">
    <van-icon
      name="bars"
      class="header-icon left-icon"
      @click="emit('open-sidebar')"
    />
    <van-icon name="add-o" class="header-icon right-icon" @click="emit('create')" />
  </div>
</template>

<style scoped lang="less">
.header-nav {
  height: 70px;
  width: 100%;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;

  .header-icon {
    font-size: 25px;
    color: #333;
    cursor: pointer;
  }
}
</style>
