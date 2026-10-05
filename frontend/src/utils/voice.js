// Thin wrapper around the browser's native Web Speech API.
// No backend, no API key — works in Chrome/Edge out of the box.
// (Firefox/Safari support for SpeechRecognition is limited; TTS works more broadly.)

// Map assistant "language" setting -> BCP-47 code for recognition/synthesis.
const LANG_CODES = {
  English: "en-US",
  Bangla: "bn-BD",
  Hindi: "hi-IN",
  Spanish: "es-ES",
};

export const getLangCode = (language) => LANG_CODES[language] || "en-US";

export const isRecognitionSupported = () =>
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// Turn a raw getUserMedia/SpeechRecognition error into one of a small, known
// set of reasons the UI already knows how to explain (see Chat.jsx).
const normalizeError = (err) => {
  const name = err?.name || err?.error || err?.message || "unknown";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "not-allowed") {
    return new Error("not-allowed");
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return new Error("no-mic-found");
  }
  if (name === "no-speech") {
    return new Error("no-speech");
  }
  return new Error(name);
};

// Explicitly ask for microphone access first. On most browsers this triggers
// a clean native "Allow microphone?" prompt even in cases where starting
// SpeechRecognition directly would silently fail — and if the user already
// denied it, this gives us a clear NotAllowedError instead of a vague one.
const ensureMicAccess = async () => {
  if (!navigator.mediaDevices?.getUserMedia) return; // nothing we can pre-check, let SpeechRecognition try directly
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop()); // we only needed the permission prompt, not the stream
  } catch (err) {
    throw normalizeError(err);
  }
};

// Starts listening once and resolves with the transcript.
// onInterim(text) is called with live partial results while the user is speaking.
export const listenOnce = async ({ language = "en-US", onInterim }) => {
  await ensureMicAccess();

  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("unsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interim += transcript;
      }
      if (onInterim) onInterim(finalTranscript + interim);
    };

    recognition.onerror = (event) => reject(normalizeError(event));
    recognition.onend = () => resolve(finalTranscript.trim());

    recognition.start();
    // expose a way to stop early if needed
    listenOnce._activeRecognition = recognition;
  });
};

export const stopListening = () => {
  listenOnce._activeRecognition?.stop();
};

export const speak = (text, language = "en-US") => {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel(); // stop any current speech first
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};