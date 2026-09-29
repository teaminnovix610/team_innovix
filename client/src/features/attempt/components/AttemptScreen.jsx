import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AttemptScreen({
    questions,
    currentIndex,
    answers,
    onSelectOption,
    onNext,
    onPrevious,
}) {
    const question = questions[currentIndex];
    const currentAnswer = answers.find((a) => a.questionId === question._id);

    if (!question) return null;

    return (
        <Card>
            <CardContent className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} / {questions.length}
                </p>

                {question.imageUrl && (
                    <img
                        src={question.imageUrl}
                        alt="Question"
                        className="max-h-64 rounded border object-contain"
                    />
                )}

                <p className="text-base font-medium whitespace-pre-wrap">
                    {question.questionText}
                </p>

                <div className="space-y-2">
                    {question.options.map((option) => {
                        const isSelected = currentAnswer?.selectedOption === option.label;

                        return (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() => onSelectOption(question._id, option.label)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                                    isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-input hover:bg-muted"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                                        isSelected && "border-primary bg-primary text-primary-foreground"
                                    )}
                                >
                                    {option.label}
                                </span>
                                {option.text}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={currentIndex === 0}
                        onClick={onPrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={currentIndex === questions.length - 1}
                        onClick={onNext}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}