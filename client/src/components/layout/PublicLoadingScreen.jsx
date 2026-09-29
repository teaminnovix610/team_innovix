import { Video, GraduationCap, Wifi } from "lucide-react";

export default function PublicLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 overflow-hidden relative flex flex-col">
      <style>{`
          @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-float-delayed { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
      `}</style>

      <Video className="block absolute top-20 left-2 sm:left-[8%] text-blue-300 animate-float" size={24} />
      <GraduationCap className="block absolute top-20 right-2 sm:right-[10%] text-emerald-300 animate-float-delayed" size={26} />
      <Wifi className="block absolute bottom-4 left-2 sm:left-[20%] text-orange-300 animate-float" size={20} />

      {/* Header — same brand mark as LoginPage */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-slate-800">
            LearnIndiaLive
          </span>
        </div>
      </header>

      {/* Centered loading state, where LoginForm would normally sit */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4 sm:p-8 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 animate-pulse text-center">
          LearnIndiaLive
        </h1>

        <div className="w-10 h-10 border-[3px] border-orange-100 border-t-orange-500 rounded-full animate-spin" />

        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}