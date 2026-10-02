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

// Starts listening once and resolves with the transcript.
// onInterim(text) is called with live partial results while the user is speaking.
export const listenOnce = ({ language = "en-US", onInterim }) => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition isn't supported in this browser"));
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

    recognition.onerror = (event) => reject(new Error(event.error || "Speech recognition error"));
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
