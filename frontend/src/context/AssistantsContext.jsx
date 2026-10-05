import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

// One shared list of the user's assistants, used by the sidebar and the
// dashboard so they never go out of sync (create / delete update both).
const AssistantsContext = createContext(null);

export const AssistantsProvider = ({ children }) => {
  const { user } = useAuth();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!user) {
      setAssistants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/assistants");
      setAssistants(res.data);
    } catch {
      setError("Couldn't load your assistants. The server may be waking up, so try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = async (id) => {
    await api.delete(`/assistants/${id}`);
    setAssistants((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <AssistantsContext.Provider value={{ assistants, loading, error, reload, remove }}>
      {children}
    </AssistantsContext.Provider>
  );
};

export const useAssistants = () => useContext(AssistantsContext);