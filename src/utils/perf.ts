type StreamPerfReport = {
  sessionId: string;
  label: string;
  status: "completed" | "failed" | "cancelled";
  durationMs: number;
  chunkCount: number;
  chunkChars: number;
  requestCount: number;
  resumeCount: number;
  markdownRenderCount: number;
  markdownInputChars: number;
  markdownOutputChars: number;
  markdownTotalMs: number;
  markdownAvgMs: number;
  markdownMaxMs: number;
  typewriterBatchCount: number;
  typewriterChars: number;
  typewriterFlushChars: number;
  scrollCount: number;
  // 新增频率统计
  chunkAvgFreq: number;
  chunkPeakFreq: number;
  renderAvgFreq: number;
  renderPeakFreq: number;
};

type StreamPerfSession = {
  sessionId: string;
  label: string;
  startedAt: number;
  ended: boolean;
  chunkCount: number;
  chunkChars: number;
  requestCount: number;
  resumeCount: number;
  markdownRenderCount: number;
  markdownInputChars: number;
  markdownOutputChars: number;
  markdownTotalMs: number;
  markdownMaxMs: number;
  typewriterBatchCount: number;
  typewriterChars: number;
  typewriterFlushChars: number;
  scrollCount: number;
};

const isPerfEnabled = () =>
  typeof window !== "undefined" &&
  (import.meta.env.DEV || localStorage.getItem("__CHAT_PERF__") === "1");

let activeSession: StreamPerfSession | null = null;
let sessionSeed = 0;

// 时间戳采样，用于计算频率峰值
type FrequencySample = { timestamp: number; type: 'chunk' | 'render' };
let frequencySamples: FrequencySample[] = [];

const now = () => performance.now();

const createSession = (label: string): StreamPerfSession => {
  sessionSeed += 1;
  return {
    sessionId: `${Date.now()}-${sessionSeed}`,
    label,
    startedAt: now(),
    ended: false,
    chunkCount: 0,
    chunkChars: 0,
    requestCount: 0,
    resumeCount: 0,
    markdownRenderCount: 0,
    markdownInputChars: 0,
    markdownOutputChars: 0,
    markdownTotalMs: 0,
    markdownMaxMs: 0,
    typewriterBatchCount: 0,
    typewriterChars: 0,
    typewriterFlushChars: 0,
    scrollCount: 0,
  };
};

const printReport = (report: StreamPerfReport) => {
  const freqInfo = `chunk: ${report.chunkAvgFreq.toFixed(1)}→${report.chunkPeakFreq.toFixed(1)}/s, render: ${report.renderAvgFreq.toFixed(1)}→${report.renderPeakFreq.toFixed(1)}/s`;
  console.groupCollapsed(
    `[chat-perf] ${report.label} ${report.status} ${report.durationMs.toFixed(1)}ms | ${freqInfo}`,
  );
  console.table(report);
  console.groupEnd();
};

export const perfTracker = {
  startStream(label = "chat-stream") {
    if (!isPerfEnabled()) return;
    activeSession = createSession(label);
    console.log("[chat-perf] start", label, activeSession.sessionId);
  },

  markRequest(isResume: boolean) {
    if (!activeSession) return;
    activeSession.requestCount += 1;
    if (isResume) {
      activeSession.resumeCount += 1;
    }
  },

  markChunk(contentLength: number) {
    if (!activeSession) return;
    activeSession.chunkCount += 1;
    activeSession.chunkChars += contentLength;
    if (isPerfEnabled()) {
      frequencySamples.push({ timestamp: now(), type: 'chunk' });
    }
  },

  recordMarkdownRender(durationMs: number, inputLength: number, outputLength: number) {
    if (!activeSession) return;
    activeSession.markdownRenderCount += 1;
    activeSession.markdownInputChars += inputLength;
    activeSession.markdownOutputChars += outputLength;
    activeSession.markdownTotalMs += durationMs;
    activeSession.markdownMaxMs = Math.max(
      activeSession.markdownMaxMs,
      durationMs,
    );
  },

  recordTypewriterBatch(charCount: number) {
    if (!activeSession) return;
    activeSession.typewriterBatchCount += 1;
    activeSession.typewriterChars += charCount;
    if (isPerfEnabled()) {
      frequencySamples.push({ timestamp: now(), type: 'render' });
    }
  },

  recordTypewriterFlush(charCount: number) {
    if (!activeSession) return;
    activeSession.typewriterFlushChars += charCount;
  },

  recordScroll() {
    if (!activeSession) return;
    activeSession.scrollCount += 1;
  },

  calculateFrequency(durationMs: number) {
    const chunkSamples = frequencySamples.filter(s => s.type === 'chunk');
    const renderSamples = frequencySamples.filter(s => s.type === 'render');

    // 计算平均频率 (次/秒)
    const chunkAvgFreq = durationMs > 0 ? (chunkSamples.length / durationMs) * 1000 : 0;
    const renderAvgFreq = durationMs > 0 ? (renderSamples.length / durationMs) * 1000 : 0;

    // 计算峰值频率：使用 500ms 滑动窗口找到最密集的时段
    const windowSize = 500;
    const calcPeak = (samples: FrequencySample[]) => {
      if (samples.length === 0) return 0;
      let peak = 0;
      for (const sample of samples) {
        const windowEnd = sample.timestamp + windowSize;
        const count = samples.filter(s => s.timestamp >= sample.timestamp && s.timestamp <= windowEnd).length;
        peak = Math.max(peak, count);
      }
      // 转换为次/秒
      return peak * (1000 / windowSize);
    };

    return {
      chunkAvgFreq,
      chunkPeakFreq: calcPeak(chunkSamples),
      renderAvgFreq,
      renderPeakFreq: calcPeak(renderSamples),
    };
  },

  endStream(status: StreamPerfReport["status"] = "completed") {
    if (!activeSession || activeSession.ended) return;
    activeSession.ended = true;
    console.log("[chat-perf] end", status, activeSession.sessionId);

    const durationMs = now() - activeSession.startedAt;
    const freqStats = this.calculateFrequency(durationMs);

    const report: StreamPerfReport = {
      sessionId: activeSession.sessionId,
      label: activeSession.label,
      status,
      durationMs,
      chunkCount: activeSession.chunkCount,
      chunkChars: activeSession.chunkChars,
      requestCount: activeSession.requestCount,
      resumeCount: activeSession.resumeCount,
      markdownRenderCount: activeSession.markdownRenderCount,
      markdownInputChars: activeSession.markdownInputChars,
      markdownOutputChars: activeSession.markdownOutputChars,
      markdownTotalMs: activeSession.markdownTotalMs,
      markdownAvgMs:
        activeSession.markdownRenderCount > 0
          ? activeSession.markdownTotalMs / activeSession.markdownRenderCount
          : 0,
      markdownMaxMs: activeSession.markdownMaxMs,
      typewriterBatchCount: activeSession.typewriterBatchCount,
      typewriterChars: activeSession.typewriterChars,
      typewriterFlushChars: activeSession.typewriterFlushChars,
      scrollCount: activeSession.scrollCount,
      chunkAvgFreq: freqStats.chunkAvgFreq,
      chunkPeakFreq: freqStats.chunkPeakFreq,
      renderAvgFreq: freqStats.renderAvgFreq,
      renderPeakFreq: freqStats.renderPeakFreq,
    };

    printReport(report);
    activeSession = null;
    frequencySamples = [];
  },
};
