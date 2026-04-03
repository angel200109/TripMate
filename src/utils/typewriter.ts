import { perfTracker } from "@/utils/perf";

export class Typewriter {
  // 暂存服务端流式返回的文本，避免每次收到数据都立刻触发渲染
  private buffer = "";
  // 标记当前是否处于逐帧消费状态
  private consuming = false;
  // 记录 requestAnimationFrame 的 id，便于停止时取消下一帧任务
  private frameId: number | null = null;

  constructor(private readonly onConsume: (str: string) => void) {}

  add(str: string) {
    if (!str) return;
    this.buffer += str;
  }

  private batchSize() {
    // 缓冲区越大，单帧消费的字符数越多，避免内容积压过久
    if (this.buffer.length > 1200) {
      return 160;
    }
    if (this.buffer.length > 600) {
      return 96;
    }
    if (this.buffer.length > 200) {
      return 48;
    }
    return 24;
  }

  private consumeBatch() {
    if (!this.buffer) {
      return;
    }

    // 每一帧只消费一小段文本，制造平滑的流式输出效果
    const chunk = this.buffer.slice(0, this.batchSize());
    this.buffer = this.buffer.slice(chunk.length);
    perfTracker.recordTypewriterBatch(chunk.length);
    this.onConsume(chunk);
  }

  private next = () => {
    if (!this.consuming) {
      this.frameId = null;
      return;
    }

    if (!this.buffer) {
      this.frameId = null;
      return;
    }

    this.consumeBatch();
    // 将下一次消费安排到浏览器下一帧，降低高频更新造成的渲染压力
    this.frameId = window.requestAnimationFrame(this.next);
  };

  start() {
    if (!this.buffer) {
      return;
    }

    if (this.consuming && this.frameId !== null) {
      return;
    }

    this.consuming = true;
    // 启动按帧消费流程，而不是同步一次性写入全部内容
    this.frameId = window.requestAnimationFrame(this.next);
  }

  done() {
    this.consuming = false;

    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    if (!this.buffer) {
      return;
    }

    // 在流结束时一次性清空剩余缓冲，确保不会遗漏最后一段文本
    perfTracker.recordTypewriterFlush(this.buffer.length);
    this.onConsume(this.buffer);
    this.buffer = "";
  }
}
