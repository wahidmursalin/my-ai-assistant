import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import {
  getLangCode,
  isRecognitionSupported,
  isSpeechSupported,
  listenOnce,
  stopListening,
  speak,
  stopSpeaking,
} from "../utils/voice.js";

export default function Chat() {
  const { id } = useParams();
  const [assistant, setAssistant] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const bottomRef = useRef(null);
  const imageInputRef = useRef(null);

  const langCode = getLangCode(assistant?.language);

  useEffect(() => {
    api.get(`/assistants/${id}`).then((res) => setAssistant(res.data));
    return () => stopSpeaking(); // don't let TTS keep talking after leaving the page
  }, [id]);

  // Resume the most recent conversation with this assistant, if one exists,
  // instead of always starting blank — this is what makes chat history "stick".
  useEffect(() => {
    setMessages([]);
    setConversationId(null);

    api.get(`/chat/conversations?assistantId=${id}`).then(async (res) => {
      const latest = res.data[0];
      if (!latest) return;

      setConversationId(latest._id);
      const { data: history } = await api.get(`/chat/conversations/${latest._id}/messages`);
      setMessages(
        history.map((m) => ({
          role: m.role,
          content: m.content,
          imageUrl: m.imageUrl || undefined,
        }))
      );
    });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setNotice("");

    try {
      const { data } = await api.post("/chat", {
        assistantId: id,
        conversationId,
        message: userMsg.content,
      });
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.memorySaved) setNotice("🧠 Saved that to memory.");
      else if (data.toolsUsed?.length) setNotice(`🔧 Used: ${data.toolsUsed.join(", ")}`);
      else if (data.usedKnowledge) setNotice("📄 Used your uploaded documents to answer.");

      if (autoSpeak) speak(data.reply, langCode);
    } catch (err) {
      const errText = `⚠️ ${err.response?.data?.message || "Something went wrong"}`;
      setMessages((prev) => [...prev, { role: "assistant", content: errText }]);
    } finally {
      setSending(false);
    }
  };

  const sendImageMessage = async () => {
    if (!imageFile || sending) return;

    const localPreview = imagePreview;
    const textCaption = input;
    setMessages((prev) => [...prev, { role: "user", content: textCaption, imageUrl: localPreview }]);
    setInput("");
    removeImage();
    setSending(true);
    setNotice("");

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("assistantId", id);
    if (conversationId) formData.append("conversationId", conversationId);
    formData.append("message", textCaption);

    try {
      const { data } = await api.post("/chat/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (autoSpeak) speak(data.reply, langCode);
    } catch (err) {
      const errText = `⚠️ ${err.response?.data?.message || "Something went wrong"}`;
      setMessages((prev) => [...prev, { role: "assistant", content: errText }]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (imageFile) sendImageMessage();
    else sendMessage(input);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleMicClick = async () => {
    if (listening) {
      stopListening();
      return;
    }
    setListening(true);
    try {
      const transcript = await listenOnce({
        language: langCode,
        onInterim: (text) => setInput(text),
      });
      setListening(false);
      if (transcript.trim()) sendMessage(transcript);
    } catch (err) {
      setListening(false);
      if (err.message === "not-allowed" || err.message === "permission-denied") {
        setNotice("🎤 Microphone is blocked. Tap the lock/site-info icon in your browser's address bar, allow Microphone access, then try again.");
      } else if (err.message === "no-speech") {
        setNotice("🎤 Didn't catch that — try again.");
      } else {
        setNotice(`🎤 ${err.message}`);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {assistant ? assistant.name : "Loading..."}
            </h1>
            {assistant && <p className="text-xs text-gray-500">{assistant.personality} · {assistant.language}</p>}
          </div>
          {isSpeechSupported() && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => {
                  setAutoSpeak(e.target.checked);
                  if (!e.target.checked) stopSpeaking();
                }}
              />
              🔊 Auto-speak replies
            </label>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-h-56 object-cover" />
                  )}
                  {m.content}
                </div>
                {m.role === "assistant" && isSpeechSupported() && (
                  <button
                    onClick={() => speak(m.content, langCode)}
                    title="Play this reply"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-600 text-sm"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && <p className="text-xs text-gray-400">Thinking...</p>}
          {notice && <p className="text-xs text-brand-600">{notice}</p>}
        </div>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-2xl mx-auto">
          {imagePreview && (
            <div className="relative inline-block mb-2">
              <img src={imagePreview} alt="Selected" className="h-16 w-16 object-cover rounded-lg border border-gray-300" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs leading-none"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-1.5 sm:gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current.click()}
              title="Attach an image"
              className="shrink-0 px-2.5 sm:px-3 py-2 rounded-md text-sm border bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              📷
            </button>

            {isRecognitionSupported() && (
              <button
                type="button"
                onClick={handleMicClick}
                title={listening ? "Stop listening" : "Speak your message"}
                className={`shrink-0 flex items-center justify-center px-2.5 sm:px-3 py-2 rounded-md border transition-colors ${
                  listening
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {listening ? (
                  <span className="relative flex items-center justify-center w-4 h-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
                    <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-3.5 h-3.5">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                imageFile
                  ? "Add a caption or question about the image (optional)..."
                  : listening
                  ? "Listening..."
                  : "Type a message... (try 'what's 235*17' or 'weather in Dhaka')"
              }
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              disabled={sending}
              className="shrink-0 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}