import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import AppLayout, { PageHeader } from "../components/AppLayout.jsx";

export default function TeachAssistant() {
  const { id } = useParams();
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
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader icon="cap" title="Teach Your AI" subtitle="Shape how it behaves and what it remembers." />
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/70">Personality</label>
            <input value={form.personality} onChange={update("personality")} className="field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Language</label>
            <input value={form.language} onChange={update("language")} className="field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">How should it behave?</label>
            <textarea value={form.customInstructions} onChange={update("customInstructions")} rows={4} className="field mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">What should it remember? (optional, adds one memory)</label>
            <textarea
              value={form.rememberThis}
              onChange={update("rememberThis")}
              rows={3}
              placeholder="e.g. I am a Software Engineering student."
              className="field mt-1.5"
            />
          </div>
          <button className="btn-primary w-full !py-3">Teach AI</button>
          {saved && <p className="text-emerald-600 text-sm text-center font-medium">Saved!</p>}
        </form>
      </div>
    </AppLayout>
  );
}