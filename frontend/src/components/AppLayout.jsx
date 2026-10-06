import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAssistants } from "../context/AssistantsContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import CatMascot from "./CatMascot.jsx";
import Icon from "./AuthIcons.jsx";
import InstallButton from "./InstallButton.jsx";
import ReviewButton from "./ReviewButton.jsx";

export function Avatar({ name, className = "w-8 h-8 text-sm" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300 font-bold shrink-0 ${className}`}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <CatMascot headOnly className="w-10 h-9" />
      <span className="font-display font-extrabold text-lg text-ink tracking-tight">
        Custom <span className="text-orange-500">AI</span>
      </span>
    </Link>
  );
}

// Shared page header: back button + title (+ optional subtitle).
export function PageHeader({ icon, title, subtitle }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-orange-600 transition-colors mb-4"
      >
        <Icon name="arrowLeft" className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300 flex items-center justify-center">
            <Icon name={icon} className="w-5 h-5" />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// Sidebar + mobile drawer shell used by every logged-in page.
// scroll={false} lets a page (Chat) manage its own inner scrolling.
export default function AppLayout({ children, scroll = true }) {
  const { user, logout } = useAuth();
  const { assistants, loading } = useAssistants();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-night-bg text-ink overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-night-border bg-night-card shrink-0">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-ink/70 p-1">
          <Icon name="menu" className="w-6 h-6" />
        </button>
        <Logo />
        <ThemeToggle className="!w-9 !h-9" />
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden" />}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 shrink-0 border-r border-night-border bg-night-card z-40 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <Logo />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="md:hidden text-ink/50">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3">
          <Link to="/assistants/new" onClick={() => setOpen(false)} className="btn-primary w-full">
            <Icon name="plus" className="w-4 h-4" /> New Assistant
          </Link>
        </div>

        <div className="mt-6 px-5 text-xs font-semibold text-ink/40 uppercase tracking-wider">Your assistants</div>
        <nav className="flex-1 overflow-y-auto px-3 mt-2 space-y-1">
          {assistants.map((a) => (
            <Link
              key={a._id}
              to={`/assistants/${a._id}/chat`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                a._id === activeId
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 font-semibold"
                  : "text-ink/70 hover:bg-orange-50 dark:hover:bg-white/5"
              }`}
            >
              <Avatar name={a.name} className="w-7 h-7 text-xs" />
              <span className="truncate">{a.name}</span>
            </Link>
          ))}
          {!loading && assistants.length === 0 && <p className="px-2.5 text-xs text-ink/40">No assistants yet</p>}
        </nav>

        <div className="p-3 border-t border-night-border space-y-3">
          <InstallButton />
          <ReviewButton />
          {user?.isAdmin && (
            <Link to="/admin/reviews" onClick={() => setOpen(false)} className="btn-soft w-full">
              View all reviews
            </Link>
          )}
          <div className="flex items-center gap-2.5 px-1">
            <Avatar name={user?.name} className="w-9 h-9 text-sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
              {user?.email && <p className="text-xs text-ink/50 truncate">{user.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 text-sm font-semibold transition-colors"
            >
              <Icon name="logout" className="w-4 h-4" /> Logout
            </button>
            <ThemeToggle className="hidden md:flex" />
          </div>
        </div>
      </aside>

      <main className={`flex-1 min-w-0 min-h-0 ${scroll ? "overflow-y-auto" : "flex flex-col overflow-hidden"}`}>
        {children}
      </main>
    </div>
  );
}