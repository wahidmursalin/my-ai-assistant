// Full-screen "please wait" overlay shown during slow operations (e.g. the
// first request after Render's free tier has spun the backend down, which
// can take 30-50s to wake up).
export default function LoadingOverlay({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl px-8 py-7 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <div>
          <p className="font-medium text-gray-800">{message}</p>
          <p className="text-xs text-gray-400 mt-1">This can take up to a minute if the server was asleep.</p>
        </div>
      </div>
    </div>
  );
}