import { Compass, Shield, BookOpen } from "lucide-react";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden relative flex flex-col">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-float-delayed { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
                .animate-float-slow { animation: float 6s ease-in-out infinite; animation-delay: 0.8s; }
            `}</style>

            {/* Decorative floating icons */}
            <Compass className="block absolute top-20 left-2 sm:left-[8%] text-blue-400/40 animate-float" size={32} />
            <Shield className="block absolute top-24 right-2 sm:right-[10%] text-cyan-400/40 animate-float-delayed" size={28} />
            <BookOpen className="block absolute bottom-8 left-2 sm:left-[20%] text-blue-300/30 animate-float-slow" size={24} />

            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="flex items-center justify-between px-6 sm:px-10 py-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Compass className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">CAPACITY CONNECT</h1>
                        <p className="text-blue-300 text-xs">Ministry of Earth Sciences</p>
                    </div>
                </div>
                <span className="text-blue-300/60 text-xs hidden sm:block">MoES · MIC</span>
            </header>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
                <LoginForm />
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-blue-400/50 text-xs relative z-10">
                © 2026 Capacity Connect · Ministry of Earth Sciences (MoES)
            </footer>
        </div>
    );
}