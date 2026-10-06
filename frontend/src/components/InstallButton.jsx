import { useEffect, useState } from "react";
import Icon from "./AuthIcons.jsx";

// Shows an "Install app" button when the browser says the app can be installed
// (Chrome / Edge / Android). Hidden when already installed or unsupported.
export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <button
      onClick={install}
      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:hover:bg-orange-500/25 text-sm font-semibold transition-colors"
    >
      <Icon name="upload" className="w-4 h-4 rotate-180" /> Install app
    </button>
  );
}