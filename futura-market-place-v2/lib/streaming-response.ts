export class StreamingResponse {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController | null = null;

  constructor() {}

  createStream() {
    const self = this;

    return new ReadableStream({
      start(controller) {
        self.controller = controller;
      },
      cancel() {
        self.controller = null;
      },
    });
  }

  write(chunk: string) {
    if (this.controller) {
      this.controller.enqueue(this.encoder.encode(chunk));
    }
  }

  writeJSON(data: any) {
    this.write(JSON.stringify(data) + '\n');
  }

  close() {
    if (this.controller) {
      this.controller.close();
      this.controller = null;
    }
  }

  error(error: Error) {
    if (this.controller) {
      this.controller.error(error);
      this.controller = null;
    }
  }
}

export async function* streamAsyncIterable<T>(
  items: T[],
  delay = 0
): AsyncIterable<T> {
  for (const item of items) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    yield item;
  }
}

export function createJSONStream<T>(
  iterable: AsyncIterable<T>
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const item of iterable) {
          const chunk = JSON.stringify(item) + '\n';
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
