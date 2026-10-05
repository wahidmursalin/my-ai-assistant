import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthHero from "../components/AuthHero.jsx";
import AuthWaves from "../components/AuthWaves.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import FloatingInput from "../components/FloatingInput.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-night-bg overflow-hidden flex flex-col">
      {submitting && <LoadingOverlay message="Creating your account..." />}
      <AuthWaves />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-2 text-ink font-display font-bold text-xl">
          Custom <span className="text-brand-400">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 text-sm text-ink/60">
            Already have an account?
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-ink border border-brand-400/40 rounded-lg px-4 py-1.5 hover:bg-brand-500/15 hover:border-brand-300 hover:scale-105 transition-all duration-200"
            >
              Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-2 items-center px-6 sm:px-10 pb-14 max-w-6xl mx-auto w-full">
        <div className="hidden lg:block">
          <AuthHero
            eyebrow="Your Personal AI Assistant"
            heading="Create your account and start your"
            highlighted="AI journey"
            description="Get instant answers, generate ideas, write better, and do more with the power of AI."
          />
        </div>

        <div className="w-full max-w-md mx-auto lg:mr-0">
          <form
            onSubmit={handleSubmit}
            className="bg-night-card/80 backdrop-blur border border-night-border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center gap-2 text-ink font-display font-bold text-lg lg:hidden mb-6">
              Custom <span className="text-brand-400">AI</span>
            </div>

            <h2 className="font-display text-xl font-semibold text-ink mb-1">Create your account</h2>
            <p className="text-ink/40 text-sm mb-6">Start building your own AI in minutes.</p>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <FloatingInput
              icon="👤"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FloatingInput
              icon="✉️"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingInput
              icon="🔒"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 text-sm"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              }
            />

            <button
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-brand-600 to-indigo-600 hover:opacity-90 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-opacity mt-2"
            >
              👤 Register →
            </button>

            <p className="text-sm text-ink/40 mt-5 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-300 hover:text-brand-200">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}