<script setup lang="ts">
import { goodsDetail } from "@/api/request";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { scrollToBottom } from "@/utils/scroll";
import { ServerGoodsDetailsItem } from "@/types";
const router = useRouter();
const route = useRoute();
const data = ref<ServerGoodsDetailsItem>({} as ServerGoodsDetailsItem); // ✅ 用 ref() 包装
onMounted(async () => {
  const id = route.params.id as string;
  goodsDetail(id).then((res) => {
    console.log(res);
    data.value = res.data;
    console.log(data.value);
  });
});

function goBack() {
  router.push("/");
}
</script>

<template>
  <div class="header">
    <div class="nav-left" @click="goBack">←</div>
    <p class="nav-title">商品详情</p>
    <div class="nav-right"></div>
  </div>
  <div class="content">
    <img :src="data.coverImage" alt="" />
    <div class="title">
      {{ data.contentTitle }}
    </div>
    <div class="price">{{ data.price }}</div>
    <div v-for="item in data.productImages" class="images">
      <img :src="item" alt="" />
    </div>
  </div>
  <div class="footer">
    <button>立刻报名</button>
  </div>
</template>

<style scoped lang="less">
.header {
  height: 50px;
  width: 100%;
  background-color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .nav-left,
  .nav-right {
    width: 50px;
    cursor: pointer;
    text-align: center;
    font-weight: bold;
  }
  .nav-title {
    text-align: center;
    line-height: 50px;
    font-size: 20px;
    color: #333;
    flex: 1;
    font-weight: bold;
  }
}
.content {
  margin-top: 50px;
  margin-bottom: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .title {
    width: 90%;
    text-align: left;
    padding: 0 20px;
    font-size: 20px;
  }
  .price {
    width: 90%;
    padding-bottom: 10px;
    text-align: left;
    color: red;
    font-size: 30px;
  }
  .images {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
img {
  width: 90%;
  border-radius: 10px;
  margin-bottom: 10px;
}
.footer {
  height: 70px;
  width: 100%;
  background-color: #ffffff;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  button {
    height: 70%;
    width: 90%;
    border-radius: 5px;
    border: 0;
    font-size: 20px;
    background-color: rgb(192, 206, 255);
  }
}
</style>
