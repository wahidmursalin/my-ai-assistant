import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AppLayout, { PageHeader, Avatar } from "../components/AppLayout.jsx";
import { StarRow } from "../components/Stars.jsx";

export default function AdminReviews() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) return;
    api
      .get("/reviews")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load reviews"));
  }, [user]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="User Reviews" subtitle="Only you can see this page." />

        {error && <p className="text-rose-500 text-sm mb-4">{error}</p>}

        {data && (
          <>
            <div className="card p-4 mb-5 flex items-center gap-4">
              <span className="font-display text-3xl font-extrabold text-ink">{data.average || "–"}</span>
              <div>
                <StarRow value={data.average} className="w-5 h-5" />
                <p className="text-xs text-ink/50 mt-0.5">{data.total} review{data.total === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.reviews.length === 0 && (
                <p className="text-center text-ink/50 text-sm border-2 border-dashed border-night-border rounded-2xl py-10">
                  No reviews yet.
                </p>
              )}
              {data.reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.user?.name} className="w-9 h-9 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">{r.user?.name || "Deleted user"}</p>
                      {r.user?.email && <p className="text-xs text-ink/50 truncate">{r.user.email}</p>}
                    </div>
                    <StarRow value={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm text-ink/80 mt-3 whitespace-pre-wrap">{r.comment}</p>}
                  <p className="text-xs text-ink/40 mt-2">{new Date(r.updatedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}