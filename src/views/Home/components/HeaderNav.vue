<script setup lang="ts">
const { text } = defineProps<{ text: string }>();
</script>

<template>
  <div>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped lang="less">
div {
  height: 50px;
  width: 100%;
  background-color: #d0e8fa;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  p {
    text-align: center;
    line-height: 50px;
    font-size: 20px;
    color: #333;
  }
}
</style>
