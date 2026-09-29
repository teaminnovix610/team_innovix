import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useAttemptReview } from "../hooks/useAttemptReview";

export default function AttemptReviewPage({ mode }) {
    const { attemptId } = useParams();
    const { data, isLoading } = useAttemptReview(attemptId, mode);

    if (isLoading || !data) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
            <div className="text-center">
                <h1 className="text-lg font-medium">Answer Review</h1>
                <p className="text-sm text-muted-foreground">
                    Score: {data.score} / {data.totalMarks}
                </p>
            </div>

            <div className="space-y-4">
                {data.questions.map((q, index) => (
                    <Card key={q.questionId}>
                        <CardContent className="space-y-3 py-4">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-muted-foreground">Question {index + 1}</p>
                                {q.wasAnswered ? (
                                    <Badge
                                        className={cn(
                                            q.wasCorrect
                                                ? "bg-green-600 text-white hover:bg-green-600/90"
                                                : "bg-destructive text-white hover:bg-destructive/90"
                                        )}
                                    >
                                        {q.wasCorrect ? "Correct" : "Wrong"}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Skipped</Badge>
                                )}
                            </div>

                            {q.imageUrl && (
                                <img
                                    src={q.imageUrl}
                                    alt="Question"
                                    className="max-h-56 rounded border object-contain"
                                />
                            )}

                            <p className="font-medium whitespace-pre-wrap">{q.questionText}</p>

                            <div className="space-y-2">
                                {q.options.map((option) => {
                                    const isCorrectOption = option.label === q.correctAnswer;
                                    const isSelectedOption = option.label === q.selectedOption;

                                    return (
                                        <div
                                            key={option.label}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg border p-3 text-sm",
                                                isCorrectOption && "border-green-600 bg-green-50",
                                                isSelectedOption && !isCorrectOption && "border-destructive bg-destructive/5"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                                                    isCorrectOption && "border-green-600 bg-green-600 text-white",
                                                    isSelectedOption && !isCorrectOption && "border-destructive bg-destructive text-white"
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                            <span className="flex-1">{option.text}</span>
                                            {isSelectedOption && (
                                                <span className="text-xs text-muted-foreground">Your answer</span>
                                            )}
                                            {isCorrectOption && !isSelectedOption && (
                                                <span className="text-xs text-green-700">Correct answer</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}