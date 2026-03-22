import Mock from "mockjs";
import type { Conversation, ConversationType } from "@/types";
import { mockConversations } from "@/store/mockConversations";

type ApiResponse<T> = {
  data: T;
  msg: string;
  error: any;
  serviceCode: number;
  code: number;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let conversationDb: Conversation[] = clone(mockConversations);

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

const ok = <T>(data: T, msg = "SUCCESS"): Response =>
  json({
    data,
    msg,
    error: null,
    serviceCode: 200,
    code: 200,
  } satisfies ApiResponse<T>);

const fail = (code: number, msg: string): Response =>
  json(
    {
      data: null,
      msg,
      error: msg,
      serviceCode: code,
      code,
    } satisfies ApiResponse<null>,
    { status: code },
  );

const normalizeConversation = (conversation: Conversation): Conversation => ({
  ...conversation,
  messages: clone(conversation.messages),
});

const getConversationTitle = (messages: ConversationType, fallback = "新的对话") => {
  const firstUserMessage = messages.find((item) => item.role === "user");
  if (!firstUserMessage) return fallback;

  const text =
    typeof firstUserMessage.content === "string"
      ? firstUserMessage.content
      : firstUserMessage.content[0]?.type === "text"
        ? firstUserMessage.content[0].text
        : "";
  const trimmedText = text.trim();

  if (!trimmedText) return fallback;
  return trimmedText.length > 20
    ? `${trimmedText.slice(0, 20)}...`
    : trimmedText;
};

const parseBody = async <T>(init?: RequestInit): Promise<T | null> => {
  if (!init?.body || typeof init.body !== "string") return null;
  return JSON.parse(init.body) as T;
};

const getGroupLabel = () => "今天";

export const setupConversationMock = () => {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const url = new URL(requestUrl, window.location.origin);

    if (!url.pathname.startsWith("/api/conversations")) {
      return originalFetch(input, init);
    }

    await Mock.mock("@natural(80,180)");

    if (url.pathname === "/api/conversations" && method === "GET") {
      return ok(conversationDb.map(normalizeConversation));
    }

    if (url.pathname === "/api/conversations" && method === "POST") {
      const body = (await parseBody<Partial<Conversation>>(init)) ?? {};
      const conversation: Conversation = {
        id: `session-${Date.now()}`,
        title: body.title || "新的对话",
        groupLabel: body.groupLabel || getGroupLabel(),
        messages: clone(body.messages ?? []),
      };
      conversationDb.unshift(conversation);
      return ok(normalizeConversation(conversation), "创建会话成功");
    }

    const match = url.pathname.match(/^\/api\/conversations\/([^/]+)$/);
    if (!match) {
      return originalFetch(input, init);
    }

    const id = decodeURIComponent(match[1]);
    const targetIndex = conversationDb.findIndex((item) => item.id === id);

    if (method === "GET") {
      if (targetIndex < 0) return fail(404, "会话不存在");
      return ok(normalizeConversation(conversationDb[targetIndex]));
    }

    if (method === "PATCH") {
      if (targetIndex < 0) return fail(404, "会话不存在");
      const body = (await parseBody<Partial<Conversation>>(init)) ?? {};
      const current = conversationDb[targetIndex];
      const nextMessages = body.messages
        ? clone(body.messages)
        : clone(current.messages);

      const updatedConversation: Conversation = {
        ...current,
        ...body,
        title: body.title || getConversationTitle(nextMessages, current.title),
        groupLabel: body.groupLabel || current.groupLabel || getGroupLabel(),
        messages: nextMessages,
      };

      conversationDb[targetIndex] = updatedConversation;
      return ok(normalizeConversation(updatedConversation), "更新会话成功");
    }

    if (method === "DELETE") {
      if (targetIndex < 0) return fail(404, "会话不存在");
      conversationDb.splice(targetIndex, 1);
      return ok(true, "删除会话成功");
    }

    return originalFetch(input, init);
  };
};
