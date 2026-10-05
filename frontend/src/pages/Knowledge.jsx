import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import AppLayout, { PageHeader } from "../components/AppLayout.jsx";
import Icon from "../components/AuthIcons.jsx";

const STATUS_STYLES = {
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function Knowledge() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const load = () => {
    api.get(`/knowledge?assistantId=${id}`).then((res) => setFiles(res.data));
  };

  useEffect(() => {
    load();
    // Poll every few seconds so "processing" flips to "ready" without a manual refresh
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assistantId", id);

    try {
      await api.post("/knowledge/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      fileInput.current.value = "";
    }
  };

  const handleDelete = async (fileId) => {
    await api.delete(`/knowledge/${fileId}`);
    load();
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          icon="file"
          title="Knowledge (RAG)"
          subtitle="Upload PDFs for this assistant. When you chat, relevant excerpts are automatically pulled in."
        />

        <label className="flex flex-col items-center border-2 border-dashed border-orange-300 bg-night-card/60 rounded-2xl p-8 text-center cursor-pointer hover:bg-orange-50 dark:hover:bg-white/5 hover:border-orange-400 transition-colors mb-4">
          <input ref={fileInput} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
          <span className="mb-2 w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Icon name="upload" className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-ink/70">{uploading ? "Uploading..." : "Click to upload a PDF"}</span>
        </label>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        <div className="space-y-2">
          {files.length === 0 && <p className="text-center text-ink/50 text-sm py-4">No documents uploaded yet.</p>}
          {files.map((f) => (
            <div key={f._id} className="card flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{f.fileName}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[f.status]}`}>{f.status}</span>
                  {f.status === "ready" && <span className="text-xs text-ink/40">{f.chunkCount} chunks</span>}
                  {f.status === "failed" && <span className="text-xs text-rose-500">{f.error}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(f._id)}
                aria-label="Delete document"
                className="w-8 h-8 shrink-0 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}