export type TextContent = {
  type: "text";
  text: string;
};
export type ImageContent = {
  type: "image_url";
  image_url: { url: string };
};
export type ServerSearchGoodsType = {
  _id: string;
  coverImage: string;
  contentTitle: string;
  price: number;
}[]; // 对象数组

// 单条对话的格式
export type ChatMessage = {
  role: "user" | "assistant";
  content: SendMessage;
  toolData?: any; // 存储返回的函数调用工具数据
  type?: "function"; // 是单纯对话还是含义工具调用的数据
  functionName?: string; // 函数名称
  progress?: boolean; // 返回进度，true表示请求中，false表示请求完成
  searchGoodsData?: ServerSearchGoodsType;
};

// ----------------对话的格式----------------
export type ConversationType = ChatMessage[];

//----------------用户发送信息的格式----------------
export type SendMessage = string | Array<TextContent | ImageContent>;

// ----------------服务器响应的数据格式----------------
export interface ApiResponse<T> {
  data: T;
  msg: string;
  error: any;
  serviceCode: number;
  code: number;
}

// ----------------大模型返回的res格式----------------
export type ServerDataType = {
  type: string;
  functionName: string;
  data: any;
};

// ----------------查询火车票传递的参数格式----------------
export type QueryTrainTicketsType = {
  departure: string;
  destination: string;
  date: string;
};

// ----------------查询火车票响应的数据格式----------------
export type ServerTrainTicketsType = {
  trainno: string;
  station: string;
  endstation: string;
  departuretime: string;
  arrivaltime: string;
  costtime: string;
  priceed: string;
};

export type QueryWeatherType = {
  city: string;
};

export type ServerQueryWeatherType = {
  daytime: string;
  day_weather: string;
  day_weather_pic: string;
  day_air_temperature: string;
  night_air_temperature: string;
}[];
