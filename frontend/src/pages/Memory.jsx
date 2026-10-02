import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";

const TYPE_COLORS = {
  preference: "bg-blue-100 text-blue-700",
  personal_info: "bg-purple-100 text-purple-700",
  instruction: "bg-amber-100 text-amber-700",
  interest: "bg-pink-100 text-pink-700",
  project: "bg-green-100 text-green-700",
  temporary: "bg-gray-100 text-gray-700",
};

export default function Memory() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">🧠 AI Memory</h1>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add something for the AI to remember..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="px-2 py-2 border border-gray-300 rounded-md text-sm">
            <option value="preference">preference</option>
            <option value="personal_info">personal_info</option>
            <option value="instruction">instruction</option>
            <option value="interest">interest</option>
            <option value="project">project</option>
            <option value="temporary">temporary</option>
          </select>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm">Add</button>
        </form>

        <div className="space-y-2">
          {memories.length === 0 && (
            <p className="text-gray-500 text-sm">No memories saved yet.</p>
          )}
          {memories.map((m) => (
            <div key={m._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-gray-800">{m.content}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${TYPE_COLORS[m.type] || ""}`}>
                  {m.type}
                </span>
              </div>
              <button onClick={() => handleDelete(m._id)} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mt-6">← Back</button>
      </div>
    </div>
  );
}
