/**
 * Wrap a long-running async task in an NDJSON stream. While the task runs we
 * emit bare-newline heartbeats every 3s so Netlify's idle timeout never fires
 * (Opus calls can take 25–55s); then a final {result} or {error} JSON line.
 * The client reads to end-of-stream and parses the last non-empty line.
 */
export function ndjsonStream<T>(
  task: () => Promise<T>,
  errorFallback: string,
): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);
      try {
        const result = await task();
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message = err instanceof Error ? err.message : errorFallback;
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
