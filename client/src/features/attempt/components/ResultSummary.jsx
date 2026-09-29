import { Card, CardContent } from "@/components/ui/card";

export default function ResultSummary({ result }) {
    const { score, totalMarks, correctCount, wrongCount, skippedCount, percentage } = result;

    return (
        <Card className="border-2 border-slate-400">
            <CardContent className="space-y-4 py-6 text-center">
                <div>
                    <p className="text-sm text-slate-600">Your Score</p>
                    <p className="text-3xl font-semibold text-slate-800">
                        {score} <span className="text-lg text-slate-600">/ {totalMarks}</span>
                    </p>
                    <p className="text-sm text-slate-600">{percentage}%</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg border-2 border-slate-400 p-3">
                        <p className="text-lg font-medium text-green-600">{correctCount}</p>
                        <p className="text-slate-600">Correct</p>
                    </div>
                    <div className="rounded-lg border-2 border-slate-400 p-3">
                        <p className="text-lg font-medium text-destructive">{wrongCount}</p>
                        <p className="text-slate-600">Wrong</p>
                    </div>
                    <div className="rounded-lg border-2 border-slate-400 p-3">
                        <p className="text-lg font-medium text-slate-700">{skippedCount}</p>
                        <p className="text-slate-600">Skipped</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}