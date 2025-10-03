<script setup lang="ts">
import { goodsDetail } from "@/api/request";
import { ServerSearchGoodsType } from "@/types/index";
defineProps<{ searchGoodsData: ServerSearchGoodsType }>();
import { useRouter } from "vue-router";
const router = useRouter();
function goodsClick(id: string) {
  router.push(`/productDetail/${id}`);
}
</script>
<template>
  <div class="productShowcase">
    <p class="title">为你推荐以下相关的旅行套餐，官方严选：</p>
    <div class="good-list">
      <div
        class="good-item"
        v-for="(item, index) in searchGoodsData"
        :key="index"
        @click="goodsClick(item._id)"
      >
        <img class="good-item" :src="item.coverImage" alt="" />
        <p class="good-title text-show">
          {{ item.contentTitle }}
        </p>
        <p class="good-price">{{ item.price }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.productShowcase {
  width: 90%;
  margin: 5px auto;
  background-color: #ffffff;
  padding: 0 10px 15px 10px;
  border-radius: 10px;
  .title {
    padding: 5px;
    color: blue;
    font-size: 16px;
    font-weight: bold;
  }
}
.good-list {
  overflow-x: auto;
  width: 100%;
  display: flex;
  gap: 10px;
  .good-item {
    width: 130px;
    background-color: rgb(250, 250, 250);
    .good-photo {
      width: 130px;
      height: 130px;

      border-radius: 5px;
    }
    .good-title {
      font-size: 15px;
      font-weight: bold;
      line-height: 1.2;
    }
    .good-price {
      font-size: 15px;
      color: red;
      padding: 2px 2px 5px 2px;
      font-weight: bold;
      margin-top: auto;
    }
  }
}
</style>
