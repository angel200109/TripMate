<template>
  <div class="chat-input-bar">
    <div class="button-or-image">
      <van-uploader
        v-if="showImage"
        v-model="fileList"
        max-count="1"
        preview-size="1.3rem"
        disabled
        class="upload-image"
        :before-delete="beforeDelete"
      />
      <div class="feature-buttons" v-else>
        <button
          class="feature-button"
          :disabled="store.prohibit"
          @click="handleQueryTrainTicket"
        >
          <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
          <div class="feature-text">查询火车票</div>
        </button>
        <button
          class="feature-button"
          :disabled="store.prohibit"
          @click="handleQueryWeather"
        >
          <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
          <div class="feature-text">查询天气</div>
        </button>
        <button
          class="feature-button"
          @click="handleSelectFile"
          :disabled="store.prohibit"
        >
          <img src="@/assets/icons/路线规划.svg" alt="" class="feature-icon" />
          <div class="feature-text">识别景点</div>
        </button>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="handleFileChange"
          style="display: none"
        />
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
        v-if="!store.prohibit"
        src="@/assets/icons/发送.svg"
        alt=""
        class="send-icon"
        @click="handleSend"
      />
      <img v-else src="@/assets/icons/禁止发送.svg" alt="" class="send-icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { chatbotMessage } from "@/store/index";
import { uploadFile } from "@/api/request";
import { showToast } from "vant";
import { ImageContent, TextContent } from "@/types";
const fileList = ref([
  {
    url: "",
  },
]);

const inputContent = ref("");
const store = chatbotMessage();
const fileInput = ref<HTMLInputElement | null>(null);
const showImage = ref(false);
// 删除图片
function beforeDelete() {
  fileList.value[0].url = "";
  showImage.value = false;
}

function handleQueryTrainTicket() {
  store.sendMessage("帮我查询火车票");
}

function handleQueryWeather() {
  store.sendMessage("帮我查询天气");
}

function handleSend() {
  if (inputContent.value != "" && fileList.value[0].url) {
    const sendImageAndText: Array<TextContent | ImageContent> = [
      { type: "text", text: inputContent.value || "" },
      {
        type: "image_url",
        image_url: {
          url: fileList.value[0]?.url || "",
        },
      },
    ];
    store.sendMessage(sendImageAndText);
    fileList.value[0].url = "";
    showImage.value = false;
    inputContent.value = "";
  } else if (inputContent.value != "") {
    store.sendMessage(inputContent.value);
    inputContent.value = "";
  }
}

function handleSelectFile() {
  fileInput.value?.click();
}
async function handleFileChange(event: Event) {
  // console.log(event);
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  // 校验是否为图片
  if (!file.type.startsWith("image/")) {
    showToast("请上传正确的图片");
    console.log("不是图片");
    target.value = ""; // 清空已选择的文件
    return;
  }
  console.log("图片文件：", file);
  const formData = new FormData();
  formData.append("file", file);
  const fileUrl = await uploadFile(formData);
  console.log(fileUrl);
  fileList.value[0].url = fileUrl.data;
  showImage.value = true;
}
</script>

<style scoped lang="less">
.chat-input-bar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  // border: 1px solid red;
  background-color: #f7f8fa;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  width: 100%;
  box-sizing: border-box; // css技术点
  height: 120px;
}
.button-or-image {
  height: 50px;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}
.upload-image {
  padding-left: 20px;
}
.feature-buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  .feature-button {
    // height: 15px;
    padding: 6px 7px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    border-radius: 10px;
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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
  // background-color: yellow;
  background-color: #fefefe;
  margin-bottom: 15px;
  .send-icon {
    width: 35px;
    height: 35px;
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

:deep(.van-uploader__wrapper--disabled) {
  opacity: inherit;
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
