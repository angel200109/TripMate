<script setup></script>

<template>
  <div class="system-avatar">
    <img src="@\assets\avatar.png" alt="" />

    <span class="assistantName">趣旅游</span>
  </div>
</template>

<style scoped>
.system-avatar {
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  width: 35%;
}

.assistantName {
  height: 20px;
  line-height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: white;
  border-radius: 20px;
  border: 2px solid #fff;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  margin-top: -25px;
  transform: translateY(50%);
  position: relative;
  z-index: 1;
  background: linear-gradient(
    to bottom right,
    #d0e2f2 0%,
    #ffffff 50%,
    #d0e2f2 100%
  );
}
</style>
