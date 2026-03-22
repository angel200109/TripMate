import { defineStore } from "pinia";
import type {
  SendMessage,
  ConversationType,
  ServerDataType,
  TextContent,
  Conversation,
  ChatMessage,
} from "@/types/index";
import {
  sendMessageApi,
  getConversationsApi,
  getConversationDetailApi,
  createConversationApi,
  updateConversationApi,
  queryTrainTicketsApi,
  queryWeatherApi,
} from "@/api/request";
import { Typewriter } from "@/utils/typewriter";

const cloneMessages = (messages: ConversationType): ConversationType =>
  JSON.parse(JSON.stringify(messages)) as ConversationType;

const getConversationTitle = (content: SendMessage) => {
  const text =
    typeof content === "string" ? content : (content[0] as TextContent).text;
  const trimmedText = text.trim();

  if (!trimmedText) return "新的对话";

  return trimmedText.length > 20
    ? `${trimmedText.slice(0, 20)}...`
    : trimmedText;
};

let activeTypewriter: Typewriter | null = null;
let activeAssistantMessage: ChatMessage | null = null;

const resetActiveTypewriter = () => {
  activeTypewriter = null;
  activeAssistantMessage = null;
};

const flushActiveTypewriter = () => {
  activeTypewriter?.done();
  resetActiveTypewriter();
};

const ensureActiveTypewriter = (message: ChatMessage) => {
  if (activeTypewriter && activeAssistantMessage === message) {
    return activeTypewriter;
  }

  flushActiveTypewriter();
  activeAssistantMessage = message;
  activeTypewriter = new Typewriter((str: string) => {
    if (typeof message.content !== "string") {
      message.content = "";
    }

    message.content += str;
    message.progress = false;
  });

  return activeTypewriter;
};

export const chatbotMessage = defineStore("chatbotMessage", {
  state: () => ({
    conversations: [] as Conversation[],
    messages: [] as ConversationType,
    currentConversationId: "",
    prohibit: false,
    userScrolled: false,
    draftInput: "",
  }),
  actions: {
    async loadConversations() {
      const response = await getConversationsApi();
      this.conversations = JSON.parse(
        JSON.stringify(response.data),
      ) as Conversation[];
    },

    syncCurrentConversation() {
      if (!this.currentConversationId) return;

      const current = this.conversations.find(
        (item) => item.id === this.currentConversationId,
      );

      if (!current) return;
      current.messages = cloneMessages(this.messages);
      void updateConversationApi(this.currentConversationId, {
        messages: current.messages,
        title: current.title,
        groupLabel: current.groupLabel,
      });
    },

    async switchConversation(id: string) {
      flushActiveTypewriter();
      const target = this.conversations.find((item) => item.id === id);
      if (!target) {
        const response = await getConversationDetailApi(id);
        this.currentConversationId = id;
        this.messages = cloneMessages(response.data.messages);
        this.userScrolled = false;
        return;
      }

      this.syncCurrentConversation();
      this.currentConversationId = id;
      this.userScrolled = false;
      this.messages = cloneMessages(target.messages);
    },

    startNewConversation() {
      flushActiveTypewriter();
      this.syncCurrentConversation();
      this.currentConversationId = "";
      this.messages = [];
      this.userScrolled = false;
    },

    async createConversation(content?: SendMessage) {
      const response = await createConversationApi({
        title: content ? getConversationTitle(content) : "新的对话",
        groupLabel: "今天",
        messages: [],
      });

      this.conversations.unshift(response.data);
      this.currentConversationId = response.data.id;
      this.messages = [];
      this.userScrolled = false;

      return response.data.id;
    },

    async ensureConversation(content?: SendMessage) {
      if (this.currentConversationId) {
        return this.currentConversationId;
      }

      return this.createConversation(content);
    },

    async sendMessage(content: SendMessage) {
      await this.ensureConversation(content);
      flushActiveTypewriter();

      this.messages.push({ role: "user", content });
      this.messages.push({
        role: "assistant",
        content: "",
        rawContent: "",
        progress: true,
      });
      this.syncCurrentConversation();
      this.userScrolled = false;
      this.prohibit = true;

      // let userMessages = "";
      // if (typeof content == "string") {
      //   userMessages = content;
      // } else {
      //   userMessages = (content[0] as TextContent).text;
      // }
      // let searchGoodsResult: ServerSearchGoodsType = [];
      // searchGoods({ userMessages }).then((res) => {
      //   console.log(res.data);
      //   searchGoodsResult = res.data;
      // });

      await sendMessageApi({ chatMessages: this.messages });
      const aiMessage = this.messages[this.messages.length - 1];
      aiMessage.progress = false;
      this.syncCurrentConversation();
      this.prohibit = false;

      return this.currentConversationId;
    },

    async regenerateLastAnswer() {
      if (this.prohibit || this.messages.length < 2) return;
      flushActiveTypewriter();

      const lastMessage = this.messages[this.messages.length - 1];
      const lastUserMessage = this.messages[this.messages.length - 2];

      if (
        !lastMessage ||
        !lastUserMessage ||
        lastMessage.role !== "assistant" ||
        lastUserMessage.role !== "user"
      ) {
        return;
      }

      this.messages.pop();
      this.messages.push({
        role: "assistant",
        content: "",
        rawContent: "",
        progress: true,
      });
      this.syncCurrentConversation();
      this.userScrolled = false;
      this.prohibit = true;

      await sendMessageApi({ chatMessages: this.messages });
      const aiMessage = this.messages[this.messages.length - 1];
      aiMessage.progress = false;
      this.syncCurrentConversation();
      this.prohibit = false;
    },

    setDraftInput(content: string) {
      this.draftInput = content;
    },

    finishStreamingMessage() {
      flushActiveTypewriter();
      this.syncCurrentConversation();
    },

    async syncConversationByRoute(id?: string) {
      flushActiveTypewriter();
      if (!id) {
        this.startNewConversation();
        return;
      }

      const target = this.conversations.find((item) => item.id === id);
      if (!target) {
        const response = await getConversationDetailApi(id).catch(() => null);
        if (!response) {
          this.startNewConversation();
          return;
        }
        this.currentConversationId = id;
        this.messages = cloneMessages(response.data.messages);
        const index = this.conversations.findIndex((item) => item.id === id);
        if (index >= 0) {
          this.conversations[index] = response.data;
        } else {
          this.conversations.unshift(response.data);
        }
        this.userScrolled = false;
        return;
      }

      this.currentConversationId = id;
      this.messages = cloneMessages(target.messages);
      this.userScrolled = false;
    },

    // 处理每一个 chunk
    async serverData(res: ServerDataType) {
      console.log("serverData:", res);
      const aiMessage = this.messages[this.messages.length - 1];
      if (!aiMessage) return;
      aiMessage.progress = false;

      if (res && res.type == "content") {
        const nextContent = String(res.data ?? "").replace(/undefined/g, "");
        aiMessage.rawContent = (aiMessage.rawContent ?? "") + nextContent;
        const typewriter = ensureActiveTypewriter(aiMessage);
        typewriter.add(nextContent);
        typewriter.start();
      }

      if (res && res.type == "function") {
        flushActiveTypewriter();
        aiMessage.type = "function";

        if (res.functionName == "get_train_tickets") {
          const { date, departure, destination } = res.data;
          aiMessage.content = `正在为你查询${departure}到${destination}${date}出发的火车票`;
          const queryRes = await queryTrainTicketsApi({
            date,
            departure,
            destination,
          });
          if (queryRes.serviceCode == 200) {
            aiMessage.content = `以下是为你查询到的${departure}到${destination}${date}出发的火车票信息：`;
            aiMessage.functionName = "get_train_tickets";
            const filteredData = queryRes.data.filter(
              (item: { priceed: string }) => item.priceed !== "-",
            );
            aiMessage.toolData = filteredData;
          } else {
            aiMessage.content = queryRes.msg;
          }
        }

        if (res.functionName == "get_weather") {
          const { city } = res.data;
          aiMessage.content = `正在为你查询${city}的天气`;
          const queryRes = await queryWeatherApi({ city });
          if (queryRes.serviceCode == 200) {
            aiMessage.content = `以下是为你查询到的${city}天气信息：`;
            aiMessage.functionName = "get_weather";
            aiMessage.toolData = queryRes.data;
          } else {
            aiMessage.content = queryRes.msg;
          }
        }
      }

      this.syncCurrentConversation();
    },
  },
});
