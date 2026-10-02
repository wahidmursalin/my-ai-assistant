import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";

const STATUS_STYLES = {
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function Knowledge() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">📄 Knowledge (RAG)</h1>
        <p className="text-sm text-gray-500 mb-6">
          Upload PDFs for this assistant. When you chat, relevant excerpts are automatically pulled in.
        </p>

        <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 mb-4">
          <input ref={fileInput} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
          <span className="text-sm text-gray-600">
            {uploading ? "Uploading..." : "Click to upload a PDF"}
          </span>
        </label>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="space-y-2">
          {files.length === 0 && <p className="text-gray-500 text-sm">No documents uploaded yet.</p>}
          {files.map((f) => (
            <div key={f._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-gray-800">{f.fileName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[f.status]}`}>{f.status}</span>
                  {f.status === "ready" && (
                    <span className="text-xs text-gray-400">{f.chunkCount} chunks</span>
                  )}
                  {f.status === "failed" && (
                    <span className="text-xs text-red-500">{f.error}</span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(f._id)} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mt-6">← Back</button>
      </div>
    </div>
  );
}
