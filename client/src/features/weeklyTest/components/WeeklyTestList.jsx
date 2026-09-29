import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TimeStatusBadge from "../../assessment/components/TimeStatusBadge";
import useLiveTimeStatus from "@/hooks/useLiveTimeStatus";

function TestCard({ assessment, questionCount, onSelect }) {
    const { timeStatus } = useLiveTimeStatus(assessment);
    const canStart = timeStatus === "LIVE";

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                    <CardTitle className="text-base">{assessment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{assessment.subject}</p>
                </div>
                <Badge variant="outline">{assessment.type}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{questionCount} questions</span>
                    <span>{assessment.duration} mins</span>
                    <span>{assessment.totalMarks} marks</span>
                </div>

                <TimeStatusBadge assessment={assessment} />

                <Button className="w-full" disabled={!canStart} onClick={() => onSelect(assessment)}>
                    {timeStatus === "UPCOMING"
                        ? "Not Started Yet"
                        : timeStatus === "ENDED"
                        ? "Ended"
                        : "Start This Test"}
                </Button>
            </CardContent>
        </Card>
    );
}

export default function WeeklyTestList({ tests, onSelect }) {
    if (!tests || tests.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No tests available for your class right now. Check back soon.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {tests.map(({ assessment, questionCount }) => (
                <TestCard
                    key={assessment._id}
                    assessment={assessment}
                    questionCount={questionCount}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}