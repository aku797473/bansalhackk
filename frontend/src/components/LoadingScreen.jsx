export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg animate-bounce-sm">
            <span className="text-3xl">🌾</span>
          </div>
          {/* Ping ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg tracking-tight">Smart Kisan</p>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-bold">Your Digital Partner</p>
        </div>

        {/* Dot loader */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
