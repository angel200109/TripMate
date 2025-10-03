import { createWebHashHistory, createRouter } from "vue-router";

import Home from "@/views/Home/Home.vue";
import GoodsDetail from "@/views/Goods/GoodsDetail.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/productDetail/:id", name: "ProductDetail", component: GoodsDetail },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
