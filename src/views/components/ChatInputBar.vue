<template>
  <div class="chat-input-bar">
    <div class="feature-buttons">
      <div class="feature-button">
        <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
        <div class="feature-text">行程规划</div>
      </div>
      <div class="feature-button">
        <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
        <div class="feature-text">交通查询</div>
      </div>
      <div class="feature-button">
        <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
        <div class="feature-text">识别景点</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-bar">
      <input
        v-model="inputContent"
        type="text"
        class="input-text"
        placeholder="输入你想咨询的旅游问题~"
        @keydown.enter="handleSend"
      />
      <img
        src="@/assets/icons/上传.svg"
        alt=""
        class="send-icon"
        @click="handleSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { chatbotMessage } from "@/store/index";

const inputContent = ref("");
const store = chatbotMessage();

function handleSend() {
  if (inputContent.value != "") {
    store.sendMessage(inputContent.value);
    inputContent.value = "";
  }
}
</script>

<style scoped lang="less">
.chat-input-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // border: 1px solid red;
  background-color: #f7f8fa;
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: 100%;
  box-sizing: border-box; // css技术点
  height: 110px;
}

.feature-buttons {
  height: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  .feature-button {
    // height: 15px;
    padding: 6px 7px;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .feature-icon {
    width: 20px;
    margin-right: 1px;
  }
  .feature-text {
    font-size: 15px;
    transform: translateY(-0.8px);
  }
}

.input-bar {
  height: 50px;
  width: 95%;
  display: flex;
  flex-direction: row;
  align-items: center;
  // border: 1px solid blue;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #fefefe;
  .send-icon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    cursor: pointer;
  }
  .input-text {
    flex: 1;
    padding: 10px 12px;
    font-size: 15px;
    border: 0px solid #ccc;
    outline: none;
    background-color: #fefefe;
    margin-left: 10px;
  }
}

// .add-photo {
//   width: 34px;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-left: 10px;
// }
// .icon-label {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .add-icon {
//   width: 25px;
//   height: 25px;
//   cursor: pointer;
// }
// .add-photo {
//   width: 34px;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-left: 10px;
// }
// .icon-label {
//   display: flex;
//   align-items: center;
//   justify-content: center;
// }
// .add-icon {
//   width: 25px;
//   height: 25px;
//   cursor: pointer;
// }

// .send-btn {
//   margin-left: 10px;
//   padding: 8px 16px;
//   background-color: #2979ff;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   font-size: 14px;
//   cursor: pointer;
//   transition: 0.2s ease;
// }

// .send-btn:disabled {
//   background-color: #ccc;
//   cursor: not-allowed;
// }
</style>
