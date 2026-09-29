import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getGuestResultsList, lookupGuestReview } from "../services/weeklyTest.service";

export default function GuestFindResultsPage() {
    const [phone, setPhone] = useState("");
    const [results, setResults] = useState(null);
    const [review, setReview] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!phone) return;

        setIsLoading(true);
        setError("");
        setReview(null);

        try {
            const list = await getGuestResultsList(phone);

            if (list.length === 0) {
                setError("No results found for this phone number");
                setResults(null);
            } else {
                setResults(list);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewReview = async (assessmentId) => {
        setIsLoading(true);
        try {
            const data = await lookupGuestReview(assessmentId, phone);
            setReview(data);
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't load this result");
        } finally {
            setIsLoading(false);
        }
    };

    // Detail view for one selected result
    if (review) {
        return (
            <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
                <Button variant="ghost" size="sm" onClick={() => setReview(null)}>
                    ← Back to results
                </Button>

                <div className="text-center">
                    <h1 className="text-lg font-medium">Answer Review</h1>
                    <p className="text-sm text-muted-foreground">
                        Score: {review.score} / {review.totalMarks}
                    </p>
                </div>

                <div className="space-y-4">
                    {review.questions.map((q, index) => (
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

    // List view — after searching by phone
    if (results) {
        return (
            <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
                <Button variant="ghost" size="sm" onClick={() => setResults(null)}>
                    ← Search a different number
                </Button>

                <h1 className="text-lg font-medium">Your Results</h1>

                <div className="space-y-3">
                    {results.map((r) => (
                        <Card key={r.attemptId}>
                            <CardContent className="flex items-center justify-between gap-3 py-4">
                                <div>
                                    <p className="font-medium">{r.title}</p>
                                    <p className="text-sm text-muted-foreground">{r.subject}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">
                                        {r.score} / {r.totalMarks}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        disabled={isLoading}
                                        onClick={() => handleViewReview(r.assessmentId)}
                                    >
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Initial phone entry
    return (
        <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Find Your Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-1.5">
                        <Label>Phone Number</Label>
                        <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="The number you used to take any test"
                        />
                        {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>
                    <Button className="w-full" disabled={isLoading} onClick={handleSearch}>
                        {isLoading ? "Searching..." : "Find My Results"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}