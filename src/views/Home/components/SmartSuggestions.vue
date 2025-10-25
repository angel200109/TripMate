<script setup lang="ts">
import { chatbotMessage } from "@/store";
import { computed, ref } from "vue";
const store = chatbotMessage();
const travelQuestionList = ref([
  "去北京旅游，有哪些必去的景点？",
  "上海有哪些适合晚上逛的地方？",
  "去西安看兵马俑还需要提前预约吗？",
  "去张家界旅游几天比较合适？",
  "重庆有哪些必吃的特色美食？",
  "杭州西湖附近有哪些值得入住的酒店？",
  "青岛有哪些拍照打卡的海边？",
  "去三亚旅游的最佳季节是什么时候？",
  "成都有哪些适合家庭出游的地方？",
  "厦门鼓浪屿有哪些人少又好玩的景点？",
  "桂林阳朔怎么玩比较省心？",
  "哈尔滨冬天有什么必体验的活动？",
  "内蒙古草原几月份去最合适？",
  "去贵州看黄果树瀑布要注意些什么？",
  "去拉萨旅游需要提前做哪些准备？",
]);
const count = ref(0);
const travelQuestionListFiltered = computed(() => {
  return JSON.parse(JSON.stringify(travelQuestionList.value)).slice(
    count.value,
    count.value + 5
  );
});
const handleRefreshQuestions = () => {
  count.value += 5;
  if (count.value >= travelQuestionList.value.length) {
    count.value = 0;
  }
};
function handleTravelQuestion(item: string) {
  store.sendMessage(item);
}
</script>

<template>
  <div class="smart-suggestions">
    <div class="role">
      我是趣旅游~你的专属旅游助手,可以帮助你规划行程和解答出游问题哦！
    </div>

    <div class="question-title">
      <div class="question-label">
        <img src="@\assets\icons\对话.svg" class="question-icon" alt="" />
        <span class="">猜你想问</span>
      </div>
      <div class="question-refresh" @click="handleRefreshQuestions">
        <img src="@\assets\icons\换一换.svg" class="question-icon" alt="" />
        <span class="">换一换</span>
      </div>
    </div>

    <div class="question-list">
      <p
        class="question-item"
        v-for="item in travelQuestionListFiltered"
        @click="handleTravelQuestion(item)"
      >
        {{ item }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="less">
.smart-suggestions {
  width: 92%;
  margin: 20px auto;
  background-color: #ffffff;
  padding-bottom: 15px;
  border-radius: 10px;
}

.role {
  padding: 13px;
  font-size: 16px;
  text-align: left;
}

.question-title {
  height: 30px;
  text-align: left;
  padding-left: 20px;
  padding-right: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 30px;
  margin-bottom: 10px;
  font-size: 16px;

  .question-label {
    height: 30px;
    display: flex;
    gap: 5px;
    line-height: 30px;
    .question-icon {
      margin-top: 1px;
      width: 20px;
    }
  }
  .question-refresh {
    height: 30px;
    display: flex;
    gap: 5px;
    line-height: 30px;
    font-size: 14px;
    color: gray;
    .question-icon {
      width: 17px;
    }
    align-self: right;
  }
}

.question-list {
  width: 90%;
  margin: auto;
  .question-item {
    background-color: #eef4ff;
    text-align: left;
    border-radius: 5px;
    margin-bottom: 10px;
    padding: 8px 15px;
    font-size: 14px;
  }
}
</style>
