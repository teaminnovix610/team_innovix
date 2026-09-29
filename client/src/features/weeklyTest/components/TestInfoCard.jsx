import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestInfoCard({ assessment, questionCount }) {
    const {
        title,
        subject,
        classRange,
        duration,
        totalMarks,
        negativeMarking,
        startDate,
        startTime,
        endTime,
    } = assessment;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <Badge variant="outline">{subject}</Badge>
                </div>
                {classRange && (
                    <p className="text-sm text-muted-foreground">
                        Class {classRange.min}–{classRange.max}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-medium">{questionCount}</p>
                        <p className="text-muted-foreground">Questions</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-medium">{duration}</p>
                        <p className="text-muted-foreground">Minutes</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-medium">{totalMarks}</p>
                        <p className="text-muted-foreground">Marks</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-medium">
                            {negativeMarking?.enabled ? "Yes" : "No"}
                        </p>
                        <p className="text-muted-foreground">Negative Marking</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>Starts: {new Date(startDate).toLocaleDateString()} at {startTime}</span>
                    <span>Ends: {endTime}</span>
                </div>

                <div className="space-y-1 text-sm">
                    <p>🏆 Rank against other students</p>
                    <p>📊 Performance analysis</p>
                    <p>🎓 Scholarship opportunity</p>
                </div>
            </CardContent>
        </Card>
    );
}