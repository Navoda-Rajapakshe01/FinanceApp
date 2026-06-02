import { subscribe, unsubscribe } from "@/lib/notifications";

export async function GET(req: Request, context: any) {
  const params = await context.params;
  const id = params?.id;
  if (!id) return new Response("Missing consultant id", { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // add to subscribers (keyed by consultant:id)
      (stream as any).__controller = controller;
      subscribe(`consultant:${id}`, controller as any);

      // send an initial connected event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", ts: Date.now() })}\n\n`));

      // keep-alive ping every 15s
      (stream as any).__keepAlive = setInterval(() => {
        try { controller.enqueue(encoder.encode(`:\n\n`)); } catch (e) {}
      }, 15000);
    },
    cancel() {
      try {
        const keepAlive = (stream as any).__keepAlive;
        if (keepAlive) clearInterval(keepAlive);
      } catch (e) {}
      try {
        const controller = (stream as any).__controller;
        if (controller) unsubscribe(`consultant:${id}`, controller as any);
      } catch (e) {}
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
