import type {
  ConversationType,
  ApiResponse,
  Conversation,
  QueryTrainTicketsType,
  ServerTrainTicketsType,
  QueryWeatherType,
  ServerQueryWeatherType,
  ServerSearchGoodsType,
  SearchGoodsType,
  ServerGoodsDetailsItem,
} from "@/types/index";
import { chatbotMessage } from "@/store/index";
import { showToast } from "vant";
const baseUrl = "/api";

// 定义统一的请求函数
const fetchApi = async (
  url: string,
  method: "POST" | "GET" | "PATCH" | "DELETE",
  body?: any,
  resType = "stream",
  reqType = "json",
) => {
  const headers: HeadersInit = {
    ...(reqType == "json" && { "Content-Type": "application/json" }),
    ...(resType == "stream" && { Accept: "text/event-stream" }),
  };
  let bodyData = null;
  if (reqType == "json") {
    // 数据变成json格式
    bodyData = JSON.stringify(body);
  } else if (method == "GET") {
    // 如果是get请求，没有请求体
    bodyData = null;
  } else {
    bodyData = body;
  }

  const option: RequestInit = {
    method,
    headers,
    body: bodyData,
  };

  try {
    // 真正发送请求的地方
    const response = await fetch(url, option);
    console.log(response);
    // 这个是fetch请求后，浏览器自带的响应封装，不是业务数据，业务数据需要.json()获取

    // -------------------对于普通请求/大模型请求，有不同的处理方法-------------------
    // 1、resType !== "stream" 是普通请求(请求数据库/查询天气/查询火车票)
    if (response.ok && resType !== "stream") {
      const result = response.json();
      return result;
    }
    if (response.ok && resType == "stream") {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      const store = chatbotMessage();
      console.log("SSE stream connected:", url);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        console.log("SSE chunk:", chunkText);
        buffer += chunkText;
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventText of events) {
          console.log("SSE eventText:", eventText);
          const lines = eventText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          const eventName = lines
            .filter((line) => line.startsWith("event:"))
            .map((line) => line.slice(6).trim())[0];
          const dataText = lines
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("\n");

          if (!dataText || eventName === "done") {
            continue;
          }

          try {
            const result = JSON.parse(dataText);
            console.log("SSE result:", result);
            store.serverData(result);
          } catch (e) {
            console.error("SSE parse error:", e, dataText);
          }
        }
      }

      store.finishStreamingMessage();
      return;
    }
    // 2、resType == "stream"是大模型请求
    if (response.ok && resType == "stream") {
      const reader = response.body?.getReader(); // 这里流式读取
      let buffer = ""; // 缓冲区，用于处理不完整的JSON
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        // console.log(value); 此处value的类型是Uint8Array，需要解码
        const decoder = new TextDecoder("utf-8");
        // 解码：Uint8Array-->JSON字符串
        const decodedString = decoder.decode(value, { stream: true });
        console.log("📥 前端一次收到的原始数据:", decodedString); // 调试信息
        buffer += decodedString; // 添加到缓冲区

        // 按换行符分割，处理多个JSON对象
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // 保留最后一个可能不完整的部分

        console.log("📊 分割后得到", lines.length, "个完整的JSON"); // 调试信息

        for (const line of lines) {
          if (line.trim() && line !== "OK") {
            try {
              const result = JSON.parse(line); // JSON字符串-->js对象
              chatbotMessage().serverData(result); // 存储大模型返回的数据
            } catch (e) {
              console.error("JSON解析错误:", e, "原始数据:", line);
            }
          }
        }
      }
    }
    // 请求错误处理，后端有响应，但有错误
    if (!response.ok) {
      const status = response.status;
      switch (status) {
        case 404:
          console.log("404错误");
          break;
        case 500:
        case 501:
        case 502:
          console.error("发生异常错误");
          showToast({ message: "服务器发生异常错误", duration: 1000 });
          break;
        case 400:
          console.error("参数不对");
          break;
        case 422:
          console.log("参数不对");
          showToast({ message: "参数不对", duration: 1000 });
      }
      showToast({ message: status });
    }
  } catch (error) {
    chatbotMessage().finishStreamingMessage();
    // 后端没开
    console.error("网络请求失败:", error);
    showToast({ message: "网络连接失败" });
  }
};

// 定义接口1：用户发送信息
export const sendMessageApi = (data: {
  chatMessages: ConversationType;
}): Promise<void> => {
  return fetchApi(`${baseUrl}/chatMessage`, "POST", data);
};

export const getConversationsApi = (): Promise<ApiResponse<Conversation[]>> => {
  return fetchApi(
    `${baseUrl}/conversations`,
    "GET",
    null,
    "notStream",
    "notJSON",
  );
};

export const getConversationDetailApi = (
  id: string,
): Promise<ApiResponse<Conversation>> => {
  return fetchApi(
    `${baseUrl}/conversations/${id}`,
    "GET",
    null,
    "notStream",
    "notJSON",
  );
};

export const createConversationApi = (data: {
  title: string;
  groupLabel: string;
  messages: ConversationType;
}): Promise<ApiResponse<Conversation>> => {
  return fetchApi(`${baseUrl}/conversations`, "POST", data, "notStream");
};

export const updateConversationApi = (
  id: string,
  data: Partial<Conversation>,
): Promise<ApiResponse<Conversation>> => {
  return fetchApi(`${baseUrl}/conversations/${id}`, "PATCH", data, "notStream");
};

export const deleteConversationApi = (
  id: string,
): Promise<ApiResponse<boolean>> => {
  return fetchApi(
    `${baseUrl}/conversations/${id}`,
    "DELETE",
    null,
    "notStream",
    "notJSON",
  );
};

// 定义接口2：查询火车票
export const queryTrainTicketsApi = (
  data: QueryTrainTicketsType,
): Promise<ApiResponse<ServerTrainTicketsType>> => {
  return fetchApi(`${baseUrl}/queryTrainTicket`, "POST", data, "notStream");
};

// 定义接口3：查询天气
export const queryWeatherApi = (
  data: QueryWeatherType,
): Promise<ApiResponse<ServerQueryWeatherType>> => {
  return fetchApi(
    `${baseUrl}/queryWeather?city=${data.city}`,
    "GET",
    "null",
    "notStream",
    "notJSON",
  );
};

// 定义接口4：搜索商品
export const searchGoods = (
  data: SearchGoodsType,
): Promise<ApiResponse<ServerSearchGoodsType>> => {
  return fetchApi(`${baseUrl}/searchGoods`, "POST", data, "notStream");
};

// 定义接口5：根据商品id获取商品详情
export const goodsDetail = (
  id: string,
): Promise<ApiResponse<ServerGoodsDetailsItem>> => {
  return fetchApi(
    `${baseUrl}/goodsDetail?goodsId=${id}`,
    "GET",
    "null",
    "notStream",
    "notJSON",
  );
};

// 定义接口6：上传文件接口（数据类型为 FormData）
// 一般浏览器会自己生成 Content-Type: multipart/form-data; boundary=...
export const uploadFile = (data: FormData): Promise<ApiResponse<string>> => {
  return fetchApi(
    `${baseUrl}/uploadFile`,
    "POST",
    data,
    "notStream",
    "notJSON",
  );
};
