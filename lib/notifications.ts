const subscribers: Map<string, Set<ReadableStreamDefaultController<Uint8Array>>> = new Map();
const encoder = new TextEncoder();

// Subscribe using a keyed recipient id: e.g. "consultant:123" or "personal:abc"
export function subscribe(recipientKey: string, controller: ReadableStreamDefaultController<Uint8Array>) {
  let set = subscribers.get(recipientKey);
  if (!set) {
    set = new Set();
    subscribers.set(recipientKey, set);
  }
  set.add(controller);
}

export function unsubscribe(recipientKey: string, controller: ReadableStreamDefaultController<Uint8Array>) {
  const set = subscribers.get(recipientKey);
  if (!set) return;
  set.delete(controller);
  if (set.size === 0) subscribers.delete(recipientKey);
}

function formatSSE(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function notifyRecipient(recipientType: string, recipientId: string, payload: any) {
  const key = `${recipientType}:${recipientId}`;
  const set = subscribers.get(key);
  if (!set || set.size === 0) return;
  const msg = formatSSE(payload);
  const bytes = encoder.encode(msg);
  set.forEach((controller) => {
    try {
      controller.enqueue(bytes);
    } catch (e) {
      try { controller.close(); } catch {}
      unsubscribe(key, controller);
    }
  });
}

// backward compatible helper for consultants
export function notifyConsultant(consultantId: string, payload: any) {
  try { notifyRecipient("consultant", consultantId, payload); } catch (e) {}
}

