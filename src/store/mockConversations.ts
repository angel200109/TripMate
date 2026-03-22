import type { Conversation } from "@/types";

export const mockConversations: Conversation[] = [
  {
    id: "session-1",
    title: "用户发送11的回应",
    groupLabel: "今天",
    messages: [
      { role: "user", content: "11 是什么含义？" },
      {
        role: "assistant",
        content:
          "如果你是在聊天里单独发 `11`，它本身没有固定语义，通常要结合上下文理解。\n\n可能的情况：\n- 只是编号或占位符\n- 表示重复确认\n- 是上一题或上一步的序号\n\n如果你愿意，我可以按你刚才的具体场景继续解释。",
      },
    ],
  },
  {
    id: "session-2",
    title: "Docker原理与容器管理问答",
    groupLabel: "今天",
    messages: [
      { role: "user", content: "Docker 和容器到底是什么关系？" },
      {
        role: "assistant",
        content:
          "可以简单理解成：\n\n- `容器` 是运行中的隔离环境\n- `Docker` 是创建、分发、运行容器的一套工具链\n\n常见流程是：先写 `Dockerfile`，再构建镜像，最后基于镜像启动容器。",
      },
      { role: "user", content: "那镜像和容器有什么区别？" },
      {
        role: "assistant",
        content:
          "- `镜像` 是静态模板\n- `容器` 是镜像启动后的运行实例\n\n一个镜像可以启动多个容器，就像同一个安装包可以开多个进程。",
      },
    ],
  },
  {
    id: "session-3",
    title: "问候与自我介绍",
    groupLabel: "昨天",
    messages: [
      { role: "user", content: "你好，先做个自我介绍" },
      {
        role: "assistant",
        content:
          "你好，我可以帮你处理前端开发、组件实现、接口联调、代码排查和方案设计。你直接给我目标，我会尽量落到代码。",
      },
    ],
  },
  {
    id: "session-4",
    title: "和为k子数组算法解释",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "解释一下和为 k 的子数组" },
      {
        role: "assistant",
        content:
          "这题核心是 `前缀和 + 哈希表`。\n\n遍历到当前位置时，若当前前缀和是 `sum`，之前出现过 `sum - k`，就说明中间这段子数组和为 `k`。",
      },
    ],
  },
  {
    id: "session-5",
    title: "前缀和题目关键词识别",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "前缀和题目一般有哪些关键词？" },
      {
        role: "assistant",
        content:
          "常见关键词有：\n- 子数组和\n- 区间和\n- 连续区间\n- 和为 k\n- 出现次数\n\n如果题目是连续区间统计，基本就该优先想到前缀和。",
      },
    ],
  },
  {
    id: "session-6",
    title: "前端Performance录制范围",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "Performance 面板录制时应该重点看什么？" },
      {
        role: "assistant",
        content:
          "先看主线程长任务、脚本执行时间、布局重排和网络瀑布流，再看交互过程里有没有明显卡顿尖峰。",
      },
    ],
  },
  {
    id: "session-7",
    title: "旅游助手项目英文命名",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "旅游助手项目起什么英文名比较自然？" },
      {
        role: "assistant",
        content:
          "如果想偏产品感，可以考虑 `TripMate`、`JourneyFlow`、`FunTrip AI`。如果想偏工具感，可以用 `Travel Copilot`。",
      },
    ],
  },
  {
    id: "session-8",
    title: "流式数据处理代码对比",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "帮我比较两种流式数据处理写法" },
      {
        role: "assistant",
        content:
          "比较时优先看三点：\n- 是否能正确处理半包\n- 是否有状态泄漏\n- UI 更新频率是否过高\n\n只快不稳的实现，后面基本都会返工。",
      },
    ],
  },
  {
    id: "session-9",
    title: "最长回文子串解法对比",
    groupLabel: "7天内",
    messages: [
      { role: "user", content: "最长回文子串有哪些常见解法？" },
      {
        role: "assistant",
        content:
          "常见有三类：\n- 中心扩展，最好写\n- 动态规划，便于理解状态转移\n- Manacher，复杂但线性时间\n\n面试里通常中心扩展就够了。",
      },
    ],
  },
  {
    id: "session-10",
    title: "最长回文子串代码问题",
    groupLabel: "30天内",
    messages: [
      { role: "user", content: "我这段最长回文子串代码哪里有问题？" },
      {
        role: "assistant",
        content:
          "先检查边界：空串、单字符、左右指针越界，还有更新答案时是否在扩展完成后再截取。",
      },
    ],
  },
  {
    id: "session-11",
    title: "路径和问题DFS改写",
    groupLabel: "30天内",
    messages: [
      { role: "user", content: "帮我把路径和题目改成 DFS 写法" },
      {
        role: "assistant",
        content:
          "DFS 写法的关键是把 `当前路径和` 当作递归参数传下去，而不是依赖外部可变状态，这样更稳。",
      },
    ],
  },
  {
    id: "session-12",
    title: "JS Set删除元素方法",
    groupLabel: "30天内",
    messages: [
      { role: "user", content: "JS 里 Set 怎么删除元素？" },
      {
        role: "assistant",
        content:
          "直接用 `set.delete(value)`。如果你要清空整个集合，用 `set.clear()`。",
      },
    ],
  },
  {
    id: "session-13",
    title: "单向数据流验证",
    groupLabel: "30天内",
    messages: [
      { role: "user", content: "怎么理解前端里的单向数据流？" },
      {
        role: "assistant",
        content:
          "核心是数据从上往下流，子组件不能直接改父组件状态，只能通过事件通知父层更新。这样状态变化路径更清晰。",
      },
    ],
  },
];
