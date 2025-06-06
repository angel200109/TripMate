// src/env.d.ts 或根目录任意 .d.ts 文件
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
