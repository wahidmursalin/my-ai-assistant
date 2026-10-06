import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAssistants } from "../context/AssistantsContext.jsx";
import AppLayout, { Avatar } from "../components/AppLayout.jsx";
import Icon from "../components/AuthIcons.jsx";

const QUICK_ACTIONS = [
  { icon: "bulb", label: "Explain", personality: "encouraging", desc: "Explains things simply", tone: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
  { icon: "code", label: "Code", personality: "professional", desc: "Helps you write code", tone: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" },
  { icon: "pen", label: "Write", personality: "friendly", desc: "Drafts and edits writing", tone: "bg-rose-100 text-rose-500 dark:bg-rose-400/15 dark:text-rose-300" },
  { icon: "book", label: "Learn", personality: "encouraging", desc: "Tutors you on a topic", tone: "bg-yellow-100 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-300" },
];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const firstName = (fullName) => capitalize(fullName?.split(" ")[0]) || "there";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { assistants, loading, error, reload, remove } = useAssistants();
  const [ask, setAsk] = useState("");

  const handleAsk = (e) => {
    e.preventDefault();
    const text = ask.trim();
    if (assistants.length > 0) {
      navigate(`/assistants/${assistants[0]._id}/chat`, { state: { prefill: text } });
    } else {
      navigate("/assistants/new", { state: { description: text } });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assistant and all of its memory/chat history?")) return;
    await remove(id);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          {getGreeting()}, <span className="text-orange-500">{firstName(user?.name)}</span>
        </h1>
        <p className="text-ink/60 mt-2">How can I help you today?</p>

        {/* Ask box */}
        <form onSubmit={handleAsk} className="mt-7 relative">
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder={assistants.length ? `Ask ${assistants[0].name} anything...` : "Describe the AI you want to create..."}
            className="field !h-14 !pl-5 !pr-16 !rounded-2xl !text-[15px]"
          />
          <button
            aria-label="Start"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 hover:brightness-105 transition"
          >
            <Icon name="send" className="w-[18px] h-[18px]" />
          </button>
        </form>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.label}
              to="/assistants/new"
              state={{ personality: qa.personality, description: qa.desc }}
              className="card px-3 py-4 flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:border-orange-300 transition-all"
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${qa.tone}`}>
                <Icon name={qa.icon} className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium text-ink/80">{qa.label}</span>
            </Link>
          ))}
        </div>

        {/* Assistants */}
        <div className="mt-10">
          <h2 className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-3">Your assistants</h2>

          {loading && (
            <div className="grid sm:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="card h-36 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="card p-6 text-center">
              <p className="text-sm text-ink/70">{error}</p>
              <button onClick={reload} className="btn-primary mt-4">Try again</button>
            </div>
          )}

          {!loading && !error && assistants.length === 0 && (
            <div className="text-center text-ink/50 text-sm border-2 border-dashed border-night-border rounded-2xl py-12 px-4">
              You haven't created any AI assistants yet.
              <div className="mt-4">
                <Link to="/assistants/new" className="btn-primary">
                  <Icon name="plus" className="w-4 h-4" /> Create your first one
                </Link>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {assistants.map((a) => (
              <div key={a._id} className="card p-5 hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} className="w-11 h-11 text-lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink truncate">{a.name}</h3>
                    <p className="text-sm text-ink/50 mt-0.5 line-clamp-2">{a.description || "No description"}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(a._id)}
                    title="Delete"
                    aria-label="Delete assistant"
                    className="w-8 h-8 shrink-0 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-500 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 flex items-center justify-center transition-colors"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 px-2.5 py-1 rounded-full">{a.personality}</span>
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 px-2.5 py-1 rounded-full">{a.language}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  <Link to={`/assistants/${a._id}/chat`} className="btn-primary !py-1.5 !px-2.5 !gap-1 !text-[13px]">
                    <Icon name="chat" className="w-4 h-4" /> Chat
                  </Link>
                  <Link to={`/assistants/${a._id}/teach`} className="btn-soft !px-2 !gap-1 !text-[13px]" title="Teach">
                    <Icon name="cap" className="w-4 h-4" /> <span>Teach</span>
                  </Link>
                  <Link to={`/assistants/${a._id}/memory`} className="btn-soft !px-2 !gap-1 !text-[13px]" title="Memory">
                    <Icon name="brain" className="w-4 h-4" /> <span>Memory</span>
                  </Link>
                  <Link to={`/assistants/${a._id}/knowledge`} className="btn-soft !px-2 !gap-1 !text-[13px]" title="Knowledge">
                    <Icon name="file" className="w-4 h-4" /> <span>Knowledge</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}