import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import AppLayout, { PageHeader } from "../components/AppLayout.jsx";
import { useAssistants } from "../context/AssistantsContext.jsx";
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
  const { reload } = useAssistants();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/assistants", form);
      await reload();
      navigate(`/assistants/${data._id}/chat`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {submitting && <LoadingOverlay tone="orange" message="Creating your AI..." />}
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader icon="sparkle" title="Create New Assistant" subtitle="Give your AI a name and a personality." />
        {error && (
          <p className="text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/70">Name</label>
            <input value={form.name} onChange={update("name")} required className="field mt-1.5" placeholder="e.g. kitty" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Description</label>
            <input value={form.description} onChange={update("description")} className="field mt-1.5" placeholder="e.g. Helps me study" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/70">Personality</label>
              <select value={form.personality} onChange={update("personality")} className="field mt-1.5">
                <option>friendly</option>
                <option>professional</option>
                <option>witty</option>
                <option>strict</option>
                <option>encouraging</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Language</label>
              <select value={form.language} onChange={update("language")} className="field mt-1.5">
                <option>English</option>
                <option>Bangla</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Response style</label>
            <select value={form.responseStyle} onChange={update("responseStyle")} className="field mt-1.5">
              <option value="simple">Simple</option>
              <option value="detailed">Detailed</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Custom instructions</label>
            <textarea
              value={form.customInstructions}
              onChange={update("customInstructions")}
              rows={4}
              placeholder="e.g. Explain difficult topics with examples. Keep answers short."
              className="field mt-1.5"
            />
          </div>
          <button disabled={submitting} className="btn-primary w-full !py-3">Create Now</button>
        </form>
      </div>
    </AppLayout>
  );
}