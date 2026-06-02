"use client";

import React, { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Reviews({ consultantId }: { consultantId: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" as "success" | "error" });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultants/reviews?consultantId=${consultantId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch reviews");
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setToast({ isOpen: true, message: (err as any)?.message || "Failed to load reviews", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, [consultantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setToast({ isOpen: true, message: "Please log in to submit a review", type: "error" });
      return;
    }

      try {
      const res = await fetch("/api/consultants/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consultantId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setToast({ isOpen: true, message: "Review submitted", type: "success" });
      setComment("");
      setRating(0);
      // optimistic refresh
      void fetchReviews();
    } catch (err) {
      console.error(err);
      setToast({ isOpen: true, message: (err as any)?.message || "Failed to submit review", type: "error" });
    }
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold text-gray-900">
              {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—"}
            </div>
                <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const avg = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
                return (
                  <Star key={i} size={16} className={`${idx <= avg ? "text-yellow-400" : "text-gray-300"}`} fill={idx <= avg ? "currentColor" : "none"} stroke="currentColor" />
                );
              })}
            </div>
            <div className="text-sm text-gray-600 ml-3">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Your rating</label>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                const filled = (hoverRating ?? rating) >= val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 -m-1 hover:text-yellow-400"
                    aria-label={`Rate ${val} stars`}
                  >
                    <Star size={20} className={`${filled ? "text-yellow-400" : "text-gray-300"}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Comment (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full mt-1 p-3 border rounded" rows={3} />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Submit review</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent reviews</h3>
        {loading ? (
          <div className="text-sm text-gray-600">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-gray-600">No reviews yet.</div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border border-gray-100 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{r.authorName}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">{r.rating}</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={`${i + 1 <= r.rating ? "text-yellow-400" : "text-gray-300"}`} fill={i + 1 <= r.rating ? "currentColor" : "none"} stroke="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
                <div className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />
    </div>
  );
}
