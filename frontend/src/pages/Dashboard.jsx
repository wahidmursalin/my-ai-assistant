import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const QUICK_ACTIONS = [
  { icon: "💡", label: "Explain", personality: "encouraging", desc: "Explains things simply" },
  { icon: "💻", label: "Code", personality: "professional", desc: "Helps you write code" },
  { icon: "✍️", label: "Write", personality: "friendly", desc: "Drafts and edits writing" },
  { icon: "📚", label: "Learn", personality: "encouraging", desc: "Tutors you on a topic" },
];

const firstName = (fullName) => fullName?.split(" ")[0] || "there";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer state

  useEffect(() => {
    api.get("/assistants").then((res) => {
      setAssistants(res.data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this assistant and all of its memory/chat history?")) return;
    await api.delete(`/assistants/${id}`);
    setAssistants((prev) => prev.filter((a) => a._id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-night-bg md:flex">
      {/* Mobile top bar — visible below md, holds the menu toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-night-border">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="text-ink/70 text-xl leading-none px-1"
        >
          ☰
        </button>
        <div className="flex items-center gap-2 text-ink font-display font-bold text-base">
          <span>✦</span> Custom AI
        </div>
        <ThemeToggle />
      </div>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on md+ */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 shrink-0 border-r border-night-border bg-night-bg z-40 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink font-display font-bold text-lg">
            <span>✦</span> Custom AI
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-ink/50 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-3">
          <Link
            to="/assistants/new"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:from-brand-500 hover:to-fuchsia-500 text-white text-sm font-medium py-2.5 rounded-lg transition-all"
          >
            + New AI
          </Link>
        </div>

        <div className="mt-6 px-5 text-xs font-medium text-ink/30 tracking-wide">Your assistants</div>
        <nav className="flex-1 overflow-y-auto px-3 mt-2 space-y-1">
          {assistants.map((a) => (
            <Link
              key={a._id}
              to={`/assistants/${a._id}/chat`}
              onClick={() => setSidebarOpen(false)}
              className="block px-2.5 py-2 rounded-lg text-sm text-ink/70 hover:bg-night-card hover:text-ink transition-colors truncate"
            >
              {a.name}
            </Link>
          ))}
          {!loading && assistants.length === 0 && (
            <p className="px-2.5 text-xs text-ink/25">No assistants yet</p>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-night-border flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex-1 text-left px-2.5 py-2 rounded-lg text-sm text-ink/50 hover:bg-night-card hover:text-ink transition-colors"
          >
            Logout
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
            {getGreeting()}, {firstName(user?.name)}
          </h1>
          <p className="text-ink/40 mt-2">How can I help you today?</p>

          <div className="mt-8 flex gap-2">
            <Link
              to="/assistants/new"
              className="flex-1 bg-night-card border border-night-border rounded-xl px-4 py-3.5 text-ink/30 text-sm hover:border-brand-500/40 transition-colors"
            >
              Ask me anything — create an AI to get started
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {QUICK_ACTIONS.map((qa) => (
              <Link
                key={qa.label}
                to="/assistants/new"
                state={{ personality: qa.personality, description: qa.desc }}
                className="bg-night-card border border-night-border rounded-xl px-3 py-3 text-center hover:border-brand-500/40 transition-colors"
              >
                <div className="text-lg">{qa.icon}</div>
                <div className="text-xs text-ink/60 mt-1">{qa.label}</div>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <h2 className="text-xs font-medium text-ink/30 tracking-wide mb-3">Your assistants</h2>

            {loading && <p className="text-ink/30 text-sm">Loading...</p>}

            {!loading && assistants.length === 0 && (
              <div className="text-center text-ink/30 text-sm border border-dashed border-night-border rounded-xl py-14 px-4">
                You haven't created any AI assistants yet.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {assistants.map((a) => (
                <div key={a._id} className="bg-night-card border border-night-border rounded-xl p-5">
                  <h3 className="font-medium text-ink">{a.name}</h3>
                  <p className="text-sm text-ink/40 mt-1">{a.description || "No description"}</p>
                  <div className="flex gap-2 mt-3 text-xs text-ink/40">
                    <span className="bg-ink/5 px-2 py-1 rounded">{a.personality}</span>
                    <span className="bg-ink/5 px-2 py-1 rounded">{a.language}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 text-sm">
                    <Link to={`/assistants/${a._id}/chat`} className="text-brand-400 font-medium">Chat</Link>
                    <Link to={`/assistants/${a._id}/teach`} className="text-ink/50 hover:text-ink">Teach</Link>
                    <Link to={`/assistants/${a._id}/memory`} className="text-ink/50 hover:text-ink">Memory</Link>
                    <Link to={`/assistants/${a._id}/knowledge`} className="text-ink/50 hover:text-ink">Knowledge</Link>
                    <button onClick={() => handleDelete(a._id)} className="text-rose-400 sm:ml-auto">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}