import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import AppLayout, { PageHeader } from "../components/AppLayout.jsx";
import Icon from "../components/AuthIcons.jsx";

const TYPE_COLORS = {
  preference: "bg-blue-100 text-blue-700",
  personal_info: "bg-violet-100 text-violet-700",
  instruction: "bg-amber-100 text-amber-700",
  interest: "bg-pink-100 text-pink-700",
  project: "bg-green-100 text-green-700",
  temporary: "bg-gray-100 text-gray-700",
};

export default function Memory() {
  const { id } = useParams();
  const [memories, setMemories] = useState([]);
  const [content, setContent] = useState("");
  const [type, setType] = useState("preference");

  const load = () => {
    api.get(`/memories?assistantId=${id}`).then((res) => setMemories(res.data));
  };

  useEffect(load, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post("/memories", { assistantId: id, content, type });
    setContent("");
    load();
  };

  const handleDelete = async (memId) => {
    await api.delete(`/memories/${memId}`);
    load();
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader icon="brain" title="AI Memory" subtitle="Things your assistant should always remember." />

        <form onSubmit={handleAdd} className="card p-3 flex flex-col sm:flex-row gap-2 mb-6">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add something for the AI to remember..."
            className="field flex-1"
          />
          <div className="flex gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)} className="field !w-auto flex-1 sm:flex-none">
              <option value="preference">preference</option>
              <option value="personal_info">personal_info</option>
              <option value="instruction">instruction</option>
              <option value="interest">interest</option>
              <option value="project">project</option>
              <option value="temporary">temporary</option>
            </select>
            <button className="btn-primary">
              <Icon name="plus" className="w-4 h-4" /> Add
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {memories.length === 0 && (
            <p className="text-center text-ink/50 text-sm border-2 border-dashed border-night-border rounded-2xl py-10">
              No memories saved yet.
            </p>
          )}
          {memories.map((m) => (
            <div key={m._id} className="card flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink">{m.content}</p>
                <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full ${TYPE_COLORS[m.type] || ""}`}>
                  {m.type}
                </span>
              </div>
              <button
                onClick={() => handleDelete(m._id)}
                aria-label="Delete memory"
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