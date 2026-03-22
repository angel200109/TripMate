import { createApp } from "vue";

import App from "./App.vue";
import router from "./router/index";
import "amfe-flexible";
import { createPinia } from "pinia";
import "vant/lib/index.css";
import { Uploader } from "vant";
import { Loading } from "vant";
import { Icon } from "vant";

if (import.meta.env.DEV) {
  const { setupConversationMock } = await import("@/mock/conversationMock");
  setupConversationMock();
}

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(Uploader);
app.use(Loading);
app.use(Icon);
app.mount("#app");
