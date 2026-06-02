"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut } from "lucide-react";
import Toast from "@/components/Toast";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  useEffect(() => {
    // Close dropdown on outside click
    const onDoc = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    // open SSE only for consultant users (consultantId in localStorage.user)
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const maybeId = parsed?.id || parsed?._id || parsed?.consultantId || parsed?.userId;
      if (!maybeId) return;
      const id = String(maybeId);
      const accountType = parsed?.accountType || (parsed?.account === "consultant" ? "consultant" : "personal");
      const isPersonal = accountType === "personal";
      const listUrl = isPersonal ? `/api/personal/${id}/notifications/list` : `/api/consultants/${id}/notifications/list`;
      const sseUrl = isPersonal ? `/api/personal/${id}/notifications` : `/api/consultants/${id}/notifications`;

      // fetch persisted notifications first
      (async () => {
        try {
          const res = await fetch(listUrl);
          const data = await res.json();
          const list = (data?.notifications || []).map((n: any) => ({ id: n._id || n.id, title: n.message || (n.data?.clientName || n.data?.clientEmail || n.type), time: n.createdAt, data: n.data, read: !!n.read }));
          setNotifications(list);
          setUnread(list.filter((x: any) => !x.read).length);
        } catch (e) {
          console.error("Failed to fetch notifications list", e);
        }
      })();

      const es = new EventSource(sseUrl);
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data || "{}");
          if (payload?.type === "booking.created") {
            const b = payload.booking || {};
            const title = b.clientName || b.clientEmail || "New booking";
            const time = new Date().toISOString();
            const note = { id: b._id || `n_${Date.now()}`, title, time, data: b, read: false };
            setNotifications((s) => [note, ...s]);
            setUnread((u) => u + 1);
          } else if (payload?.type === "notification.created") {
            const n = payload.notification || {};
            const title = n.message || (n.data?.clientName || n.data?.clientEmail || n.type || "Notification");
            const time = n.createdAt || new Date().toISOString();
            const note = { id: n._id || n.id || `n_${Date.now()}`, title, time, data: n.data, read: !!n.read };
            setNotifications((s) => [note, ...s]);
            setUnread((u) => u + 1);
            // show immediate toast for goal warnings
            try {
              const ttype = n.type || (n.data && n.data.type) || "";
              if (ttype === "goal.warning" || n.type === "goal.warning") {
                setToastMessage(n.message || "Goal warning");
                setToastType("error");
                setToastOpen(true);
              }
            } catch (e) {}
          }
        } catch (e) {
          // ignore non-json or ping messages
        }
      };
      es.onerror = () => {
        // EventSource will attempt reconnects; nothing special here
      };
      esRef.current = es;
    } catch (e) {
      // ignore
    }
    return () => {
      try { esRef.current?.close(); } catch {}
      esRef.current = null;
    };
  }, []);

  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      setUnread(0);
      // mark persisted notifications as read
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const maybeId = parsed?.id || parsed?._id || parsed?.consultantId || parsed?.userId;
        if (!maybeId) return;
        const id = String(maybeId);
        const accountType = parsed?.accountType || (parsed?.account === "consultant" ? "consultant" : "personal");
        const isPersonal = accountType === "personal";
        const markUrl = isPersonal ? `/api/personal/${id}/notifications/mark-read` : `/api/consultants/${id}/notifications/mark-read`;
        fetch(markUrl, { method: "POST" }).catch(() => {});
        // optimistically mark local notifications as read
        setNotifications((s) => s.map((n) => ({ ...n, read: true })));
      } catch (e) {}
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-2">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="CashSpace"
                width={264}
                height={64}
                priority
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggle} className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">{unread}</span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
                  <div className="p-3 border-b border-gray-100 font-semibold flex items-center justify-between">
                    <div>Notifications</div>
                    <div className="flex gap-3">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const raw = localStorage.getItem("user");
                            if (!raw) return;
                            const parsed = JSON.parse(raw);
                            const maybeId = parsed?.id || parsed?._id || parsed?.consultantId || parsed?.userId;
                            if (!maybeId) return;
                            const id = String(maybeId);
                            const accountType = parsed?.accountType || (parsed?.account === "consultant" ? "consultant" : "personal");
                            const isPersonal = accountType === "personal";
                            const markUrl = isPersonal ? `/api/personal/${id}/notifications/mark-read` : `/api/consultants/${id}/notifications/mark-read`;
                            await fetch(markUrl, { method: "POST" });
                            setNotifications((s) => s.map((n) => ({ ...n, read: true })));
                            setUnread(0);
                          } catch (err) {
                            console.error("Failed to mark notifications read", err);
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const raw = localStorage.getItem("user");
                            if (!raw) return;
                            const parsed = JSON.parse(raw);
                            const maybeId = parsed?.id || parsed?._id || parsed?.consultantId || parsed?.userId;
                            if (!maybeId) return;
                            const id = String(maybeId);
                            const accountType = parsed?.accountType || (parsed?.account === "consultant" ? "consultant" : "personal");
                            const isPersonal = accountType === "personal";
                            const clearUrl = isPersonal ? `/api/personal/${id}/notifications/clear` : `/api/consultants/${id}/notifications/clear`;
                            await fetch(clearUrl, { method: "POST" });
                            setNotifications([]);
                            setUnread(0);
                          } catch (err) {
                            console.error("Failed to clear notifications", err);
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(n.time).toLocaleString()}</div>
                        <div className="mt-2 text-sm text-gray-700">{n.title}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition">
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </Link>
          </div>
        </nav>
      </div>
        <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
      </header>
  );
}
