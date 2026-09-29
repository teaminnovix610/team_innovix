import { useParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import LeaderboardTable from "../../attempt/components/LeaderboardTable";
import { useAnalytics } from "../../attempt/hooks/useAnalytics";
import { useLeaderboard } from "../../attempt/hooks/useLeaderboard";
import { useAssessmentDetail } from "../hooks/useAssessmentDetail";

export default function AssessmentAnalyticsPage() {
    const { assessmentId } = useParams();

    const { data: assessmentData, isLoading: isLoadingAssessment } = useAssessmentDetail(assessmentId);
    const { data: analytics, isLoading: isLoadingAnalytics } = useAnalytics(assessmentId);
    const { data: leaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard(assessmentId);

    if (isLoadingAssessment) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-lg font-medium">{assessmentData.assessment.title} — Analytics</h1>

            {isLoadingAnalytics ? (
                <Skeleton className="h-24 rounded-lg" />
            ) : (
                <Card>
                    <CardContent className="grid grid-cols-4 gap-2 py-4 text-center text-sm">
                        <div>
                            <p className="text-lg font-medium">{analytics.appeared}</p>
                            <p className="text-muted-foreground">Appeared</p>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-green-600">{analytics.highest}</p>
                            <p className="text-muted-foreground">Highest</p>
                        </div>
                        <div>
                            <p className="text-lg font-medium">{analytics.average}</p>
                            <p className="text-muted-foreground">Average</p>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-destructive">{analytics.lowest}</p>
                            <p className="text-muted-foreground">Lowest</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <h2 className="text-base font-medium">Leaderboard</h2>
                {isLoadingLeaderboard ? (
                    <Skeleton className="h-40 rounded-lg" />
                ) : (
                    <LeaderboardTable entries={leaderboard} />
                )}
            </div>
        </div>
    );
}