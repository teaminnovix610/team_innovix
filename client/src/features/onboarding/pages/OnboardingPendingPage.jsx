import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Video, Wifi, GraduationCap, Clock } from "lucide-react";

export default function OnboardingPendingPage() {
    const { user, logout } = useAuth();

    const isPendingTeacher = user?.role === "TEACHER" && user?.isApproved === false;

    if (!isPendingTeacher) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50 to-white flex items-center justify-center p-4 sm:p-6">
            <Video
                className="absolute top-10 left-6 sm:left-16 text-sky-400/60 animate-[float_5s_ease-in-out_infinite]"
                size={32}
            />
            <GraduationCap
                className="absolute top-16 right-6 sm:right-20 text-emerald-400/60 animate-[float_6s_ease-in-out_infinite_0.5s]"
                size={36}
            />
            <Wifi
                className="absolute bottom-16 left-10 sm:left-24 text-amber-400/60 animate-[float_5.5s_ease-in-out_infinite_1s]"
                size={28}
            />

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-12px); }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(16px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .fade-in-up {
                        animation: fadeInUp 0.6s ease-out both;
                    }
                `}
            </style>

            <div className="relative max-w-lg w-full">
                <div className="rounded-2xl border-2 border-orange-200 bg-white shadow-sm p-6 sm:p-10 text-center space-y-5 sm:space-y-6 fade-in-up">
                    <div
                        className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-100 flex items-center justify-center fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <Clock className="text-orange-600 animate-pulse" size={32} />
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl font-bold text-slate-900 fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        Welcome to{" "}
                        <span className="text-orange-600">LearnIndiaLive</span>,{" "}
                        {user?.firstName}!
                    </h1>

                    <p
                        className="text-sm sm:text-base text-slate-600 fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Thank you for choosing LearnIndiaLive to share your knowledge
                        and inspire learners.
                    </p>

                    <div
                        className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 text-left fade-in-up"
                        style={{ animationDelay: "0.25s" }}
                    >
                        <p className="text-sm sm:text-base text-slate-700">
                            Our team is currently reviewing your profile. Once
                            approved, you'll gain access to all teaching features,
                            including creating batches, scheduling live classes, and
                            managing your students.
                        </p>
                    </div>

                    <p
                        className="text-sm sm:text-base text-slate-600 fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                    >
                        We're looking forward to having you teach with us. We'll
                        notify you as soon as your account is ready.
                    </p>

                    <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-50 fade-in-up"
                        style={{ animationDelay: "0.35s" }}
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}