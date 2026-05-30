"use client";

import React, { useEffect, useMemo, useState } from "react";
import Toast from "@/components/Toast";

type Slot = { start: string; end: string; booked?: boolean };
type DateEntry = { date: string; slots: Slot[] };

export default function ScheduleManager({ consultantId }: { consultantId?: string | null }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [datesMap, setDatesMap] = useState<Record<string, Slot[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<Slot>({ start: "09:00", end: "10:00" });
  const [editing, setEditing] = useState<{ index: number; slot: Slot } | null>(null);

  const [commonSlots, setCommonSlots] = useState<Array<{ days: number[]; start: string; end: string }>>([]);
  const [commonDaysSelection, setCommonDaysSelection] = useState<number[]>([]);
  const [commonStart, setCommonStart] = useState("09:00");
  const [commonEnd, setCommonEnd] = useState("10:00");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const monthKey = useMemo(() => `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`, [viewDate]);

  useEffect(() => {
    const q = new URLSearchParams();
    q.set("month", monthKey);
    if (consultantId) q.set("consultantId", consultantId);
    const headers: Record<string, string> = {};
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`/api/consultants/schedule?${q.toString()}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, Slot[]> = {};
        (data?.dates || []).forEach((d: DateEntry) => {
          // ensure slots include possible `booked` flag coming from the server
          map[d.date] = (d.slots || []).map((s: any) => ({ start: s.start, end: s.end, booked: !!s.booked }));
        });
        setDatesMap(map);
      })
      .catch((err) => {
        console.error("failed to load month", err);
        setDatesMap({});
      });
  }, [monthKey, consultantId]);

  const getMonthGrid = (base: Date) => {
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    const grid: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      grid.push(d);
    }
    return grid;
  };

  const grid = useMemo(() => getMonthGrid(viewDate), [viewDate]);

  // Use local date components to produce YYYY-MM-DD (avoid UTC shifts)
  const formatISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Build headers for authenticated requests; include Authorization only when token is present.

  async function addSlot(date: string, slot: Slot) {
    try {
      const existing = datesMap[date] || [];
      if (existing.some((s) => s.start === slot.start && s.end === slot.end)) {
        showToast("This timeslot already exists for the day.", "error");
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/consultants/schedule`, {
        method: "POST",
        headers,
        body: JSON.stringify({ date, slot }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("addSlot failed", res.status, data);
        showToast("Failed to add slot.", "error");
        return;
      }

      // prefer server-returned slots if available
      const returned = Array.isArray(data?.dates) ? data.dates.find((d: any) => d.date === date) : null;
      const slotsForDate = returned ? returned.slots || [] : [...existing, slot];
      setDatesMap((prev) => ({ ...(prev || {}), [date]: slotsForDate }));
      showToast("Timeslot added.", "success");
    } catch (err) {
      console.error("addSlot failed", err);
      showToast("Failed to add slot.", "error");
    }
  }

  async function updateSlot(date: string, slotIndex: number, slot: Slot) {
    try {
      const arrExisting = datesMap[date] || [];
      if (arrExisting.some((s, i) => i !== slotIndex && s.start === slot.start && s.end === slot.end)) {
        showToast("This timeslot would duplicate an existing one.", "error");
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/consultants/schedule`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ op: "edit", date, slotIndex, slot }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("updateSlot failed", res.status, data);
        showToast("Failed to update slot.", "error");
        return;
      }

      // Update using server response if provided
      const returned = Array.isArray(data?.dates) ? data.dates.find((d: any) => d.date === date) : null;
      if (returned) {
        setDatesMap((prev) => ({ ...(prev || {}), [date]: returned.slots || [] }));
      } else {
        setDatesMap((prev) => {
          const arr = (prev[date] || []).slice();
          arr[slotIndex] = slot;
          return { ...prev, [date]: arr };
        });
      }
      setEditing(null);
    } catch (err) {
      console.error("updateSlot failed", err);
      showToast("Failed to update slot.", "error");
    }
  }

  async function removeSlot(date: string, slotIndex: number) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`/api/consultants/schedule`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ date, slotIndex }),
      });
      setDatesMap((prev) => {
        const arr = (prev[date] || []).slice();
        arr.splice(slotIndex, 1);
        return { ...prev, [date]: arr };
      });
    } catch (err) {
      console.error("removeSlot failed", err);
    }
  }

  function toggleCommonDay(day: number) {
    setCommonDaysSelection((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function addCommonSlotToList() {
    if (commonDaysSelection.length === 0) return;
    setCommonSlots((s) => [...s, { days: commonDaysSelection.slice(), start: commonStart, end: commonEnd }]);
    setCommonDaysSelection([]);
  }

  async function applyCommonSlots() {
    // if user has a weekday/time selected but didn't click "Add Rule", include it automatically
    if (commonSlots.length === 0 && commonDaysSelection.length === 0) {
      showToast("No common slots defined. Select weekdays and click 'Add Rule' first.", "error");
      return;
    }
    const slotsToApply = commonSlots.length === 0 && commonDaysSelection.length > 0
      ? [{ days: commonDaysSelection.slice(), start: commonStart, end: commonEnd }]
      : commonSlots;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.Authorization = `Bearer ${token}`;
      console.debug("applyCommon: sending", slotsToApply);
      const res = await fetch(`/api/consultants/schedule`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ op: "applyCommon", month: monthKey, slots: slotsToApply }),
      });
      const text = await res.text();
      console.debug("applyCommon: raw response", res.status, text);
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
      console.debug("applyCommon: parsed response", parsed);
      if (!res.ok) {
        console.error("applyCommon failed", res.status, parsed || text);
        showToast(`Apply failed: ${res.status} ${text}`, "error");
        return;
      }
      // re-fetch month (include auth header)
      const q = new URLSearchParams();
      q.set("month", monthKey);
      if (consultantId) q.set("consultantId", consultantId);
      const reHeaders: Record<string, string> = {};
      const reToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (reToken) reHeaders.Authorization = `Bearer ${reToken}`;
      const res2 = await fetch(`/api/consultants/schedule?${q.toString()}`, { headers: reHeaders });
      const data = await res2.json();
      if (!res2.ok) {
        console.error("re-fetch month failed", res2.status, data);
        showToast(`Reload failed: ${res2.status}`, "error");
        return;
      }
      const map: Record<string, Slot[]> = {};
      (data?.dates || []).forEach((d: DateEntry) => (map[d.date] = d.slots || []));
      setDatesMap(map);
    } catch (err) {
      console.error("applyCommonSlots failed", err);
      showToast("Apply failed (see console)", "error");
    }
  }

  return (
    <>
      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
      <div className="flex gap-6">
      <div className="flex-1 bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-900">Schedule Manager</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded bg-white text-gray-800 hover:bg-gray-50 shadow-sm" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>Prev</button>
            <div className="px-3 py-1 font-medium text-gray-900">{viewDate.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
            <button className="px-3 py-1 border rounded bg-white text-gray-800 hover:bg-gray-50 shadow-sm" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>Next</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm text-gray-800 mb-1 font-medium">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="text-center text-gray-900">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {grid.map((d) => {
            const iso = formatISO(d);
            const inMonth = d.getMonth() === viewDate.getMonth();
            const slots = datesMap[iso] || [];
            return (
              <div key={iso} onClick={() => setSelectedDate(iso)} className={`p-2 border border-gray-200 rounded h-32 flex flex-col justify-between cursor-pointer ${inMonth ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-600'}`}>
                <div className="flex justify-between items-start">
                  <div className="text-sm font-semibold text-gray-900">{d.getDate()}</div>
                  <button title="Quick add 09:00-10:00" onClick={(e)=>{e.stopPropagation(); addSlot(iso,{start:'09:00',end:'10:00'})}} className="text-sm text-blue-600 font-semibold bg-white border border-gray-200 rounded px-2">+</button>
                </div>

                    <div className="flex-1 overflow-hidden text-xs mt-1">
                      {slots.length === 0 && <div className="text-gray-500">No slots</div>}
                      {slots.slice(0,3).map((s,i)=>(
                        <div key={i} className="mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.booked ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {s.start} - {s.end}
                          </span>
                        </div>
                      ))}
                      {slots.length > 3 && <div className="text-sm text-gray-600">+{slots.length-3} more</div>}
                    </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="w-96 bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900">Selected Date</div>
          <div className="text-xs text-gray-600">Click a cell to view or edit slots</div>
        </div>

        {selectedDate ? (
          <div>
            <div className="mb-2 font-medium text-gray-900">{selectedDate}</div>
                <div className="space-y-2 mb-3">
                {(datesMap[selectedDate] || []).map((s, i) => (
                <div key={i} className={`flex items-center justify-between gap-2 p-2 rounded border ${s.booked ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="text-sm font-medium">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${s.booked ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.start} — {s.end}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`text-sm font-medium ${s.booked ? 'text-gray-400' : 'text-blue-700'}`} onClick={() => setEditing({ index: i, slot: s })} disabled={!!s.booked}>Edit</button>
                    <button className={`text-sm font-medium ${s.booked ? 'text-red-700' : 'text-red-700'}`} onClick={() => removeSlot(selectedDate, i)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {editing ? (
              <div className="space-y-2">
                <div className="text-xs">Edit slot</div>
                <div className="flex gap-2">
                  <input type="time" value={editing.slot.start} onChange={(e)=>setEditing({...editing, slot:{...editing.slot, start:e.target.value}})} className="flex-1 p-1 border rounded" />
                  <input type="time" value={editing.slot.end} onChange={(e)=>setEditing({...editing, slot:{...editing.slot, end:e.target.value}})} className="flex-1 p-1 border rounded" />
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>{ if(editing) updateSlot(selectedDate, editing.index, editing.slot); }}>Save</button>
                  <button className="px-3 py-1 border rounded" onClick={()=>setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
                <div className="space-y-2">
                <div className="text-xs font-medium text-gray-800">Add new slot</div>
                <div className="flex gap-2">
                  <input type="time" value={newSlot.start} onChange={(e)=>setNewSlot({...newSlot, start:e.target.value})} className="flex-1 p-2 border border-gray-200 rounded bg-white" />
                  <input type="time" value={newSlot.end} onChange={(e)=>setNewSlot({...newSlot, end:e.target.value})} className="flex-1 p-2 border border-gray-200 rounded bg-white" />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-md" onClick={()=>{ addSlot(selectedDate, newSlot); setNewSlot({start:'09:00', end:'10:00'}) }}>Add</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No date selected</div>
        )}

        <div className="mt-6 border-t pt-4">
          <div className="font-semibold mb-2 text-gray-900">Common Slots (weekday rules)</div>
          <div className="text-xs text-gray-600 mb-2">Select weekdays and a time, add to list, then Apply to current month.</div>

          <div className="flex flex-wrap gap-2 mb-3">
            {[0,1,2,3,4,5,6].map(d=> (
              <button key={d} onClick={()=>toggleCommonDay(d)} className={`px-2 py-1 text-sm border rounded ${commonDaysSelection.includes(d)?'bg-blue-600 text-white':'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <input type="time" value={commonStart} onChange={(e)=>setCommonStart(e.target.value)} className="flex-1 p-1 border rounded" />
            <input type="time" value={commonEnd} onChange={(e)=>setCommonEnd(e.target.value)} className="flex-1 p-1 border rounded" />
          </div>

          <div className="space-y-2 mb-3">
            {commonSlots.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>{c.start}–{c.end} on {c.days.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(',')}</div>
                <div className="flex gap-2">
                  <button onClick={()=>setCommonSlots(cs=>cs.filter((_,idx)=>idx!==i))} className="text-red-600 text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={applyCommonSlots}>Apply to month</button>
          </div>
        </div>
      </aside>
    </div>
    </>
  );
}
