import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

export default function CreateAssistant() {
  const location = useLocation();
  const prefill = location.state || {};

  const [form, setForm] = useState({
    name: "",
    description: prefill.description || "",
    personality: prefill.personality || "friendly",
    language: "English",
    responseStyle: "simple",
    customInstructions: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/assistants", form);
      navigate(`/assistants/${data._id}/chat`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {submitting && <LoadingOverlay message="Creating your AI..." />}
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Create New Assistant</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input value={form.name} onChange={update("name")} required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. kitty" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <input value={form.description} onChange={update("description")}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="e.g. Helps me study" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Personality</label>
              <select value={form.personality} onChange={update("personality")}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>friendly</option>
                <option>professional</option>
                <option>witty</option>
                <option>strict</option>
                <option>encouraging</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Language</label>
              <select value={form.language} onChange={update("language")}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>English</option>
                <option>Bangla</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Response style</label>
            <select value={form.responseStyle} onChange={update("responseStyle")}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Custom instructions</label>
            <textarea value={form.customInstructions} onChange={update("customInstructions")}
              rows={4} placeholder="e.g. Explain difficult topics with examples. Keep answers short."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <button
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2 rounded-md text-sm font-medium"
          >
            Create Now
          </button>
        </form>
      </div>
    </div>
  );
}