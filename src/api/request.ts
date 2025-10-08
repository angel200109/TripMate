import {
  ConversationType,
  ApiResponse,
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
const baseUrl = "http://172.22.208.32:3000";

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
    // 2、resType == "stream"是大模型请求
    if (response.ok && resType == "stream") {
      const reader = response.body?.getReader(); // 这里流式读取
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        // console.log(value); 此处value的类型是Uint8Array，需要解码
        const decoder = new TextDecoder("utf-8");
        const decodedString = decoder.decode(value); // 解码：Uint8Array-->JSON字符串
        let result;
        // 最后回复完，会回一个“OK”，这个没必要存了
        if (decodedString && decodedString !== "OK") {
          result = JSON.parse(decodedString); // JSON字符串-->js对象
        }
        [];
        chatbotMessage().serverData(result); // 存储大模型返回的数据
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
    // 后端没开
    console.error("网络请求失败:", error);
    showToast({ message: "网络连接失败" });
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

// 定义接口3：查询天气
export const queryWeatherApi = (
  data: QueryWeatherType
): Promise<ApiResponse<ServerQueryWeatherType>> => {
  return fetchApi(
    `${baseUrl}/queryWeather?city=${data.city}"`,
    "GET",
    "null",
    "notStream",
    "notJSON"
  );
};

// 定义接口4：搜索商品
export const searchGoods = (
  data: SearchGoodsType
): Promise<ApiResponse<ServerSearchGoodsType>> => {
  return fetchApi(`${baseUrl}/searchGoods`, "POST", data, "notStream");
};

// 定义接口5：根据商品id获取商品详情
export const goodsDetail = (
  id: string
): Promise<ApiResponse<ServerGoodsDetailsItem>> => {
  return fetchApi(
    `${baseUrl}/goodsDetail?goodsId=${id}`,
    "GET",
    "null",
    "notStream",
    "notJSON"
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
    "notJSON"
  );
};
