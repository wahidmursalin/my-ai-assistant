import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";

export default function TeachAssistant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    personality: "",
    language: "",
    customInstructions: "",
    rememberThis: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/assistants/${id}`).then((res) => {
      const a = res.data;
      setForm({
        personality: a.personality,
        language: a.language,
        customInstructions: a.customInstructions,
        rememberThis: "",
      });
    });
  }, [id]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/assistants/${id}/teach`, form);
    setSaved(true);
    setForm({ ...form, rememberThis: "" });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Teach Your AI</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Personality</label>
            <input value={form.personality} onChange={update("personality")}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Language</label>
            <input value={form.language} onChange={update("language")}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">How should it behave?</label>
            <textarea value={form.customInstructions} onChange={update("customInstructions")} rows={4}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">What should it remember? (optional, adds one memory)</label>
            <textarea value={form.rememberThis} onChange={update("rememberThis")} rows={3}
              placeholder="e.g. I am a Software Engineering student."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md text-sm font-medium">
            Teach AI
          </button>
          {saved && <p className="text-green-600 text-sm text-center">Saved!</p>}
        </form>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mt-4">← Back</button>
      </div>
    </div>
  );
}
