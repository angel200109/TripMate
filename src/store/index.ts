import { defineStore } from "pinia";
import { SendMessage, ConversationType, ServerDataType } from "@/types/index";
import { sendMessageApi, queryTrainTicketsApi } from "@/api/request";
import { scrollToBottom } from "@/utils/scroll";
import { log } from "console";

export const chatbotMessage = defineStore("chatbotMessage", {
  state: () => ({
    messages: [] as ConversationType,
  }),
  actions: {
    // 方法1：用户发信息
    async sendMessage(content: SendMessage) {
      this.messages.push({ role: "user", content });
      this.messages.push({ role: "assistant", content: "", progress: true });
      // 请求大模型回复
      await sendMessageApi({ chatMessages: this.messages });
      console.log("对话完毕了");
      console.log(this.messages);
      // this.messages
      //   .map((m) => console.log(`${m.role}: ${JSON.stringify(m.content)}`))
      //   .join("\n");
      scrollToBottom();
    },

    // 方法2：接收服务器端返回的信息
    async serverData(res: ServerDataType) {
      let aiMessage = this.messages[this.messages.length - 1];
      aiMessage.progress = false; // 关闭loading加载
      console.log(res);

      // ----------------大模型回复的是正常内容----------------
      if (res && res.type == "content") {
        console.log("*****大模型回复的是正常内容*****");
        res.data = res.data.replace(/undefined/g, "");
        aiMessage.content += res.data;
      }

      // ----------------大模型回复的是function----------------
      if (res && res.type == "function") {
        console.log("*****大模型回复的是function*****");
        aiMessage["type"] = "function";
        // 1、若查询火车票
        if (res.functionName == "get_train_tickets") {
          const { date, departure, destination } = res.data;
          aiMessage.content = `正在为你查询${departure}到${destination}${date}出发的火车票`;
          const queryRes = await queryTrainTicketsApi({
            date,
            departure,
            destination,
          });
          if (queryRes.serviceCode == 200) {
            aiMessage.content = `以下是为你查询到的${departure}到${destination}${date}出发的火车票信息:`;
            aiMessage["functionName"] = "get_train_tickets";
            aiMessage["toolData"] = queryRes.data;
            console.log(queryRes.data);
          } else {
            aiMessage.content = queryRes.msg;
          }
        }
        // 2、若查询天气
      }
    },
  },
});
