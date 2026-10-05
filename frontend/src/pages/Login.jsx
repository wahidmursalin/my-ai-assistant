import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthHero from "../components/AuthHero.jsx";
import AuthWaves from "../components/AuthWaves.jsx";
import AuthTopBar from "../components/AuthTopBar.jsx";
import AuthInput from "../components/AuthInput.jsx";
import CatMascot from "../components/CatMascot.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-theme relative min-h-screen bg-night-bg overflow-hidden flex flex-col">
      {submitting && <LoadingOverlay tone="orange" message="Logging you in..." />}
      <AuthWaves />

      <AuthTopBar prompt="Don't have an account?" to="/register" cta="Register" />

      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center px-6 sm:px-10 pb-14 max-w-7xl mx-auto w-full">
        <div className="hidden lg:block">
          <AuthHero
            eyebrow="Your Personal AI Assistant"
            heading="Welcome back to your"
            highlighted="AI journey"
            description="Pick up right where you left off — your assistants, memory, and chats are all waiting."
          />
        </div>

        <div className="w-full max-w-md mx-auto lg:mr-0">
          <form
            onSubmit={handleSubmit}
            className="bg-night-card/90 backdrop-blur border border-night-border rounded-3xl p-6 sm:p-7 shadow-2xl shadow-orange-500/15"
          >
            <div className="flex items-center gap-4 mb-6">
              <CatMascot headOnly className="w-16 h-14 shrink-0" />
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink leading-tight">Welcome back</h2>
                <p className="text-ink/60 text-[15px] mt-1">Continue your AI journey.</p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <AuthInput icon="mail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <AuthInput icon="lock" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button
              disabled={submitting}
              className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:brightness-105 disabled:opacity-60 text-white rounded-xl text-[15px] font-bold shadow-lg shadow-orange-500/30 transition mt-1"
            >
              Login →
            </button>

            <p className="text-sm text-ink/70 mt-5 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}