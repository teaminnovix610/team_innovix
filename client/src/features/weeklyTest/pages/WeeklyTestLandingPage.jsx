import { useState } from "react";
import { Video, GraduationCap, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import ClassLevelForm from "../components/ClassLevelForm";
import WeeklyTestList from "../components/WeeklyTestList";
import GuestDetailsForm from "../components/GuestDetailsForm";

import { usePublicWeeklyTests } from "../hooks/usePublicWeeklyTests";

function WeeklyTestShell({ children }) {
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

            <header className="flex items-center justify-between px-4 sm:px-8 py-2 sm:py-3 lg:py-2 relative z-10">
                <img
                    src="/logo.webp"
                    alt="CapacityConnect"
                    className="w-52 sm:w-64 lg:w-48 h-auto"
                />
            </header>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-2 relative z-10">
                {children}
            </div>
        </div>
    );
}

export default function WeeklyTestLandingPage() {
    const [classLevel, setClassLevel] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const { data: tests, isLoading } = usePublicWeeklyTests(classLevel);

    // Step 1: ask for class
    if (!classLevel) {
        return (
            <WeeklyTestShell>
                <div className="w-full max-w-lg space-y-4">
                    <ClassLevelForm onSubmit={setClassLevel} />
                </div>
            </WeeklyTestShell>
        );
    }

    // Step 3: details collected, ready to start
    if (selectedAssessment) {
        return (
            <WeeklyTestShell>
                <div className="w-full max-w-lg space-y-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAssessment(null)}>
                        ← Back to test list
                    </Button>
                    <GuestDetailsForm assessmentId={selectedAssessment._id} classLevel={classLevel} />
                </div>
            </WeeklyTestShell>
        );
    }

    // Step 2: pick a test from the list for this class
    return (
        <WeeklyTestShell>
            <div className="w-full max-w-lg space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-medium text-slate-800">Tests for Class {classLevel}</h1>
                    <Button variant="ghost" size="sm" onClick={() => setClassLevel(null)}>
                        Change class
                    </Button>
                </div>

                {isLoading ? (
                    <Skeleton className="h-40 rounded-lg" />
                ) : (
                    <WeeklyTestList tests={tests} onSelect={setSelectedAssessment} />
                )}
            </div>
        </WeeklyTestShell>
    );
}