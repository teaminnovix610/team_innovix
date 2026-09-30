// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { Video, GraduationCap, Wifi, EyeIcon, ClockIcon } from "lucide-react";

// import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";

// import ResultSummary from "../components/ResultSummary";
// import LeaderboardTable from "../components/LeaderboardTable";
// import LockedFeatureCard from "../components/LockedFeatureCard";

// import { useAttemptQuery } from "../hooks/useAttemptQuery";
// import { useLeaderboard } from "../hooks/useLeaderboard";
// import { useAssessmentDetail } from "../../assessment/hooks/useAssessmentDetail";
// import { usePublicAssessmentDetail } from "../../weeklyTest/hooks/usePublicAssessmentDetail";
// import useLiveTimeStatus from "@/hooks/useLiveTimeStatus";

// export default function ResultPage({ mode }) {
//     const { assessmentId, attemptId: routeAttemptId } = useParams();
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();

//     const attemptId = mode === "student" ? routeAttemptId : searchParams.get("attemptId");

//     const { data: attempt, isLoading: isLoadingAttempt } = useAttemptQuery(attemptId, mode);
//     const { data: leaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard(
//         mode === "student" ? assessmentId : null
//     );

//     // Need the assessment's real end time to gate "View Details" — a student
//     // finishing early shouldn't see correct answers before the window closes
//     // for everyone else still taking the test.
//     const studentAssessmentQuery = useAssessmentDetail(mode === "student" ? assessmentId : null);
//     const guestAssessmentQuery = usePublicAssessmentDetail(mode === "guest" ? assessmentId : null);
//     const assessmentData = mode === "guest" ? guestAssessmentQuery.data : studentAssessmentQuery.data;

//     const { timeStatus } = useLiveTimeStatus(assessmentData?.assessment);
//     const reviewUnlocked = timeStatus === "ENDED";

//     const reviewPath =
//         mode === "guest"
//             ? `/weekly-test/results/${attemptId}/review`
//             : `/results/${attemptId}/review`;

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 overflow-hidden relative flex flex-col">
//             <style>{`
//                 @keyframes float {
//                     0%, 100% { transform: translateY(0px); }
//                     50% { transform: translateY(-12px); }
//                 }
//                 .animate-float { animation: float 4s ease-in-out infinite; }
//                 .animate-float-delayed { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
//             `}</style>

//             <Video className="block absolute top-20 left-2 sm:left-[8%] text-blue-300 animate-float" size={24} />
//             <GraduationCap className="block absolute top-20 right-2 sm:right-[10%] text-emerald-300 animate-float-delayed" size={26} />
//             <Wifi className="block absolute bottom-4 left-2 sm:left-[20%] text-orange-300 animate-float" size={20} />

//             {/* Header */}
//             <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 relative z-10">
//                 <div className="flex items-center gap-2">
//                     <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
//                         L
//                     </div>
//                     <span className="text-lg sm:text-xl font-extrabold text-slate-800">
//                         CapacityConnect
//                     </span>
//                 </div>
//             </header>

//             {/* Content */}
//             <div className="flex-1 px-4 py-8 relative z-10">
//                 {isLoadingAttempt || !attempt ? (
//                     <div className="mx-auto max-w-2xl space-y-4">
//                         <Skeleton className="h-40 rounded-lg" />
//                     </div>
//                 ) : (
//                     <div className="mx-auto max-w-2xl space-y-4">
//                         <h1 className="text-center text-lg font-medium">Congratulations!</h1>

//                         <ResultSummary
//                             result={{
//                                 score: attempt.score,
//                                 totalMarks: attempt.totalMarks,
//                                 correctCount: attempt.correctCount,
//                                 wrongCount: attempt.wrongCount,
//                                 skippedCount: attempt.skippedCount,
//                                 percentage: attempt.totalMarks
//                                     ? Math.round((attempt.score / attempt.totalMarks) * 100)
//                                     : null,
//                             }}
//                         />

//                         {reviewUnlocked ? (
//                             <Button
//                                 className="w-full"
//                                 size="lg"
//                                 onClick={() => navigate(reviewPath)}
//                             >
//                                 <EyeIcon className="mr-1.5 size-4" />
//                                 View Details
//                             </Button>
//                         ) : (
//                             <Button className="w-full" size="lg" variant="secondary" disabled>
//                                 <ClockIcon className="mr-1.5 size-4" />
//                                Answer key available once the test ends for everyone
//                             </Button>
//                         )}

//                         {mode === "guest" ? (
//                             <>
//                                 <LockedFeatureCard
//                                     title="Detailed Analysis"
//                                     description="See subject-wise breakdown and time per question"
//                                 />
//                                 <LockedFeatureCard
//                                     title="Leaderboard"
//                                     description="See how you rank against other students"
//                                 />
//                             </>
//                         ) : (
//                             <>
//                                 <h2 className="text-base font-medium">Leaderboard</h2>
//                                 {isLoadingLeaderboard ? (
//                                     <Skeleton className="h-40 rounded-lg" />
//                                 ) : (
//                                     <LeaderboardTable entries={leaderboard} />
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }



//reverting back to the version when a student submit the test see direcltly the test



import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Video, GraduationCap, Wifi, EyeIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import ResultSummary from "../components/ResultSummary";
import LeaderboardTable from "../components/LeaderboardTable";
import LockedFeatureCard from "../components/LockedFeatureCard";

import { useAttemptQuery } from "../hooks/useAttemptQuery";
import { useLeaderboard } from "../hooks/useLeaderboard";

export default function ResultPage({ mode }) {
    const { assessmentId, attemptId: routeAttemptId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const attemptId = mode === "student" ? routeAttemptId : searchParams.get("attemptId");

    const { data: attempt, isLoading: isLoadingAttempt } = useAttemptQuery(attemptId, mode);
    const { data: leaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard(
        mode === "student" ? assessmentId : null
    );

    const reviewPath =
        mode === "guest"
            ? `/weekly-test/results/${attemptId}/review`
            : `/results/${attemptId}/review`;

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

            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        L
                    </div>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-800">
                        CapacityConnect
                    </span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 px-4 py-8 relative z-10">
                {isLoadingAttempt || !attempt ? (
                    <div className="mx-auto max-w-2xl space-y-4">
                        <Skeleton className="h-40 rounded-lg" />
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-4">
                        <h1 className="text-center text-lg font-medium">Congratulations!</h1>

                        <ResultSummary
                            result={{
                                score: attempt.score,
                                totalMarks: attempt.totalMarks,
                                correctCount: attempt.correctCount,
                                wrongCount: attempt.wrongCount,
                                skippedCount: attempt.skippedCount,
                                percentage: attempt.totalMarks
                                    ? Math.round((attempt.score / attempt.totalMarks) * 100)
                                    : null,
                            }}
                        />

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => navigate(reviewPath)}
                        >
                            <EyeIcon className="mr-1.5 size-4" />
                            View Details
                        </Button>

                        {mode === "guest" ? (
                            <>
                                <LockedFeatureCard
                                    title="Detailed Analysis"
                                    description="See subject-wise breakdown and time per question"
                                />
                                <LockedFeatureCard
                                    title="Leaderboard"
                                    description="See how you rank against other students"
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-base font-medium">Leaderboard</h2>
                                {isLoadingLeaderboard ? (
                                    <Skeleton className="h-40 rounded-lg" />
                                ) : (
                                    <LeaderboardTable entries={leaderboard} />
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}