<script setup></script>

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
      <div class="question-refresh">
        <img src="@\assets\icons\换一换.svg" class="question-icon" alt="" />
        <span class="">换一换</span>
      </div>
    </div>

    <div class="question-list">
      <p class="question-item">帮我规划一个北京三日游的行程</p>
      <p class="question-item">去云南避暑，有什么推荐的高原湖泊？</p>
      <p class="question-item">去西北大环线是跟团好还是自驾好？</p>
      <p class="question-item">去西藏需要提前准备什么药？</p>
      <p class="question-item">推荐几个适合带小朋友去的历史景点</p>
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
    padding: 10px 15px;
    font-size: 16px;
  }
}
</style>
