import { createWebHistory, createRouter } from "vue-router";

import Home from "@/views/Home/Home.vue";
import GoodsDetail from "@/views/Goods/GoodsDetail.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/chat/:id", name: "ChatDetail", component: Home },
  { path: "/productDetail/:id", name: "ProductDetail", component: GoodsDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
