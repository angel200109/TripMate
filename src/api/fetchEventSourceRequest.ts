import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source";
import type { ConversationType, ServerDataType } from "@/types/index";
import { chatbotMessage } from "@/store/index";
import { showToast } from "vant";
import { perfTracker } from "@/utils/perf";

const baseUrl = "/api";
const MAX_RESUME_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1200;
const MAX_RETRY_DELAY_MS = 8000;
const RETRY_BACKOFF_FACTOR = 2;
const RETRY_JITTER_FACTOR = 0.2;

type StreamState = {
  requestId: string;
  lastChunkId: number;
  done: boolean;
  sessionEstablished: boolean;
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const createStreamError = (message: string) => {
  const error = new Error(message);
  error.name = "StreamError";
  return error;
};

const getRetryDelay = (attempt: number) => {
  const baseDelay = Math.min(
    INITIAL_RETRY_DELAY_MS * RETRY_BACKOFF_FACTOR ** Math.max(attempt - 1, 0),
    MAX_RETRY_DELAY_MS,
  );
  const jitterRange = baseDelay * RETRY_JITTER_FACTOR;
  const jitterOffset = (Math.random() * 2 - 1) * jitterRange;
  return Math.max(0, Math.round(baseDelay + jitterOffset));
};

const handleStreamPayload = (
  payload: ServerDataType & {
    requestId?: string;
    chunkId?: number;
    done?: boolean;
    error?: string;
  },
  state: StreamState,
) => {
  if (payload.requestId) {
    state.requestId = payload.requestId;
  }

  if (typeof payload.chunkId === "number") {
    if (payload.chunkId <= state.lastChunkId) {
      return;
    }
    state.lastChunkId = payload.chunkId;
  }

  if (payload.type === "meta") {
    const metaRequestId = payload.data?.requestId;
    if (typeof metaRequestId === "string" && metaRequestId) {
      state.requestId = metaRequestId;
    }
    return;
  }

  perfTracker.markChunk(
    typeof payload.data === "string"
      ? payload.data.length
      : JSON.stringify(payload.data ?? "").length,
  );
  chatbotMessage().serverData(payload);
};

const runSingleStream = async (
  endpoint: string,
  body: Record<string, unknown>,
  state: StreamState,
) => {
  const controller = new AbortController();

  await fetchEventSource(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal: controller.signal,
    openWhenHidden: true,
    async onopen(response) {
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        throw createStreamError(`HTTP_${response.status}`);
      }
      if (!contentType.includes(EventStreamContentType)) {
        throw createStreamError("INVALID_CONTENT_TYPE");
      }
      if (endpoint === "/chatMessage/stream") {
        state.sessionEstablished = true;
      }
    },
    onmessage(message) {
      if (message.event === "done") {
        try {
          const payload = JSON.parse(message.data) as {
            requestId?: string;
            chunkId?: number;
            done?: boolean;
          };
          if (payload.requestId) {
            state.requestId = payload.requestId;
          }
          if (typeof payload.chunkId === "number") {
            state.lastChunkId = Math.max(state.lastChunkId, payload.chunkId);
          }
        } catch {}
        state.done = true;
        controller.abort();
        return;
      }

      if (message.event === "error") {
        let errorMessage = "流式请求失败";
        try {
          const payload = JSON.parse(message.data) as { error?: string };
          errorMessage = payload.error || errorMessage;
        } catch {}
        throw createStreamError(errorMessage);
      }

      if (!message.data) return;
      const payload = JSON.parse(message.data) as ServerDataType & {
        requestId?: string;
        chunkId?: number;
      };
      handleStreamPayload(payload, state);
    },
    onclose() {
      if (!state.done) {
        throw createStreamError("STREAM_CLOSED");
      }
    },
    onerror(error) {
      throw error;
    },
  });
};

export const sendMessageByFetchEventSourceApi = async (data: {
  chatMessages: ConversationType;
}): Promise<void> => {
  console.log("[chat-perf] api entered");
  perfTracker.startStream("chat-stream");

  const state: StreamState = {
    requestId: crypto.randomUUID(),
    lastChunkId: 0,
    done: false,
    sessionEstablished: false,
  };

  let attempts = 0;

  while (!state.done) {
    const endpoint = state.sessionEstablished
      ? "/chatMessage/resume"
      : "/chatMessage/stream";
    const body = state.sessionEstablished
      ? {
          requestId: state.requestId,
          lastChunkId: state.lastChunkId,
        }
      : {
          ...data,
          requestId: state.requestId,
        };

    try {
      perfTracker.markRequest(state.sessionEstablished);
      await runSingleStream(endpoint, body, state);
      attempts = 0;
      if (state.done) {
        chatbotMessage().finishStreamingMessage();
        return;
      }
    } catch (error) {
      attempts += 1;
      if (attempts > MAX_RESUME_ATTEMPTS) {
        perfTracker.endStream("failed");
        chatbotMessage().finishStreamingMessage();
        console.error("fetch-event-source stream failed:", error);
        showToast({ message: "流式连接已中断，请稍后重试" });
        throw error;
      }
      await delay(getRetryDelay(attempts));
    }
  }
};
