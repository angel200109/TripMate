<template>
  <div class="chat-input-bar">
    <!-- <div class="button-or-image">
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
          <img src="@/assets/icons/璺嚎瑙勫垝.svg" alt="" class="feature-icon" />
          <div class="feature-text">查询火车票</div>
        </button>
        <button
          class="feature-button"
          :disabled="store.prohibit"
          @click="handleQueryWeather"
        >
          <img src="@/assets/icons/璺嚎瑙勫垝.svg" alt="" class="feature-icon" />
          <div class="feature-text">查询天气</div>
        </button>
        <button
          class="feature-button"
          @click="handleSelectFile"
          :disabled="store.prohibit"
        >
          <img src="@/assets/icons/璺嚎瑙勫垝.svg" alt="" class="feature-icon" />
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
    </div> -->

    <div class="input-bar">
      <input
        v-model="inputContent"
        type="text"
        class="input-text"
        placeholder="有问题，尽管问"
        @keydown.enter="handleSend"
      />
      <van-icon
        name="upgrade"
        class="send-icon"
        :class="{ 'has-content': inputContent && !store.prohibit }"
        @click="handleSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { chatbotMessage } from "@/store/index";
import { uploadFile } from "@/api/request";
import { ImageContent, TextContent } from "@/types";

const fileList = ref([
  {
    url: "",
  },
]);

const inputContent = ref("");
const store = chatbotMessage();
const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
const showImage = ref(false);

function beforeDelete() {
  fileList.value[0].url = "";
  showImage.value = false;
}

async function navigateToCurrentConversation() {
  if (!store.currentConversationId) return;
  await router.replace(`/chat/${store.currentConversationId}`);
}

async function handleQueryTrainTicket() {
  store.ensureConversation("帮我查询火车票");
  await navigateToCurrentConversation();
  await store.sendMessage("帮我查询火车票");
}

async function handleQueryWeather() {
  store.ensureConversation("帮我查询天气");
  await navigateToCurrentConversation();
  await store.sendMessage("帮我查询天气");
}

async function handleSend() {
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
    store.ensureConversation(sendImageAndText);
    await navigateToCurrentConversation();
    await store.sendMessage(sendImageAndText);
    fileList.value[0].url = "";
    showImage.value = false;
    inputContent.value = "";
  } else if (inputContent.value != "") {
    store.ensureConversation(inputContent.value);
    await navigateToCurrentConversation();
    await store.sendMessage(inputContent.value);
    inputContent.value = "";
  }
}

function handleSelectFile() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("请上传正确的图片");
    target.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  const fileUrl = await uploadFile(formData);
  fileList.value[0].url = "http://" + fileUrl.data;
  showImage.value = true;
}
</script>

<style scoped lang="less">
.chat-input-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
  height: 100px;
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
  height: 50%;
  width: 90%;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: white;
  margin: auto;

  .send-icon {
    font-size: 30px;
    color: #ccc;
    margin-right: 10px;
    cursor: pointer;
    transition: color 0.3s;
  }

  .send-icon.has-content {
    color: #2979ff;
  }

  .input-text {
    flex: 1;
    padding: 10px 12px;
    font-size: 15px;
    border: 0 solid #ccc;
    outline: none;
    background-color: white;
    margin-left: 10px;
  }
}

:deep(.van-uploader__wrapper--disabled) {
  opacity: inherit;
}
</style>
