import {
  ConversationType,
  ApiResponse,
  QueryTrainTicketsType,
  ServerTrainTicketsType,
} from "@/types/index";
import { chatbotMessage } from "@/store/index";
const baseUrl = "http://127.0.0.1:3000";

// 定义统一的请求函数
const fetchApi = async (
  url: string,
  method: "POST" | "GET",
  body?: any,
  resType = "stream",
  reqType = "json"
) => {
  const headers: HeadersInit = {
    ...(reqType == "json" && { "Content-Type": "application/json" }),
  };

  let bodyData = null;
  if (reqType == "json") {
    bodyData = JSON.stringify(body);
  } else if (method == "GET") {
    bodyData = null;
  } else {
    bodyData = body;
  }
  const option: RequestInit = {
    method,
    headers,
    body: bodyData,
  };

  const response = await fetch(url, option);
  console.log(response); // 这个是fetch请求后，浏览器自带的响应封装，不是业务数据，业务数据需要.json()获取

  // -------------------对于普通请求/大模型请求，有不同的处理方法-------------------
  // 1.普通请求(请求数据库/请求第三方接口)
  if (response.ok && resType !== "stream") {
    console.log("111");

    const result = response.json();
    console.log(result);

    return result;
  }
  // 2.大模型请求
  if (response.ok && resType == "stream") {
    const reader = response.body.getReader(); // 这里流式读取
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      // console.log(value); 从处value的类型是Uint8Array，需要解码
      const decoder = new TextDecoder("utf-8");
      const decodedString = decoder.decode(value); // 解码成字符串
      let result;
      // 最后回复完，会回一个“OK”，这个没必要存了
      if (decodedString && decodedString !== "OK") {
        result = JSON.parse(decodedString); // 字符串转成对象
      }
      chatbotMessage().serverData(result); // 存储大模型返回的数据
    }
  }
};

// 定义接口1：用户发送信息
export const sendMessageApi = (data: {
  chatMessages: ConversationType;
}): Promise<ApiResponse<Buffer>> => {
  return fetchApi(`${baseUrl}/chatMessage`, "POST", data);
};

// 定义接口2：查询火车票
export const queryTrainTicketsApi = (
  data: QueryTrainTicketsType
): Promise<ApiResponse<ServerTrainTicketsType>> => {
  return fetchApi(`${baseUrl}/queryTrainTicket`, "POST", data, "notStream");
};
