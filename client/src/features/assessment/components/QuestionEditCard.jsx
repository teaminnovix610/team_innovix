import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useUpdateQuestion } from "../hooks/useUpdateQuestion";
import { useDeleteQuestion } from "../hooks/useDeleteQuestion";

export default function QuestionEditCard({ assessmentId, question, index, readOnly = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [questionText, setQuestionText] = useState(question.questionText);
    const [options, setOptions] = useState(question.options);
    const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
    const [marks, setMarks] = useState(question.marks);

    const { mutate: updateQuestion, isPending: isSaving } = useUpdateQuestion(assessmentId);
    const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuestion(assessmentId);

    const updateOption = (i, text) => {
        setOptions((prev) => prev.map((opt, idx) => (idx === i ? { ...opt, text } : opt)));
    };

    const handleSave = () => {
        updateQuestion(
            {
                questionId: question._id,
                data: {
                    questionText,
                    options,
                    correctAnswer,
                    marks: Number(marks),
                },
            },
            { onSuccess: () => setIsEditing(false) }
        );
    };

    const handleCancel = () => {
        setQuestionText(question.questionText);
        setOptions(question.options);
        setCorrectAnswer(question.correctAnswer);
        setMarks(question.marks);
        setIsEditing(false);
    };

    const handleConfirmDelete = () => {
        deleteQuestion(question._id, {
            onSuccess: () => setConfirmOpen(false),
        });
    };

    if (!isEditing) {
        return (
            <>
                <Card>
                    <CardContent className="space-y-2 py-4">
                        <div className="flex items-start justify-between gap-2">
                            <p className="flex-1 text-sm">
                                <span className="text-muted-foreground">{index + 1}. </span>
                                {question.questionText}
                            </p>
                            <div className="flex shrink-0 gap-1">
                                {!readOnly && (
                                    <>
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={() => setIsEditing(true)}
                                            aria-label="Edit question"
                                        >
                                            <PencilIcon className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={() => setConfirmOpen(true)}
                                            aria-label="Delete question"
                                        >
                                            <TrashIcon className="size-4 text-destructive" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {question.imageUrl && (
                            <img src={question.imageUrl} alt="Question" className="h-16 rounded border object-cover" />
                        )}
                        <p className="text-xs text-muted-foreground">
                            {question.marks} marks · Correct answer: {question.correctAnswer}
                        </p>
                    </CardContent>
                </Card>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete this question?</DialogTitle>
                            <DialogDescription>
                                This can't be undone. Total marks will be recalculated.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                            <Button
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <Card>
            <CardContent className="space-y-4 py-4">
                <div className="grid gap-1.5">
                    <Label>Question</Label>
                    <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} />
                </div>

                {question.imageUrl && (
                    <img src={question.imageUrl} alt="Question" className="h-20 rounded border object-cover" />
                )}

                <div className="grid grid-cols-2 gap-3">
                    {options.map((option, i) => (
                        <div key={option.label} className="grid gap-1.5">
                            <Label>Option {option.label}</Label>
                            <Input value={option.text} onChange={(e) => updateOption(i, e.target.value)} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                        <Label>Correct Answer</Label>
                        <div className="flex gap-2">
                            {options.map((option) => (
                                <Button
                                    key={option.label}
                                    type="button"
                                    size="sm"
                                    variant={correctAnswer === option.label ? "default" : "outline"}
                                    onClick={() => setCorrectAnswer(option.label)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Marks</Label>
                        <Input
                            type="number"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            min={1}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="button" className="flex-1" disabled={isSaving} onClick={handleSave}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}