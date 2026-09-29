import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "../hooks/useUploadImage";

export default function QuestionForm({ order, onAdd, isSubmitting }) {
    const [questionText, setQuestionText] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [options, setOptions] = useState([
        { label: "A", text: "" },
        { label: "B", text: "" },
        { label: "C", text: "" },
        { label: "D", text: "" },
    ]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [marks, setMarks] = useState(1);

    const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        uploadImage(file, {
            onSuccess: (data) => setImageUrl(data.imageUrl),
        });
    };

    const updateOption = (index, text) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, text } : opt)));
    };

    const reset = () => {
        setQuestionText("");
        setImageUrl(null);
        setOptions([
            { label: "A", text: "" },
            { label: "B", text: "" },
            { label: "C", text: "" },
            { label: "D", text: "" },
        ]);
        setCorrectAnswer("");
        setMarks(1);
    };

    const handleSubmit = () => {
        onAdd({
            questionText,
            isLatex: false,
            imageUrl,
            options,
            correctAnswer,
            marks: Number(marks),
            order,
        });
        reset();
    };

    const isValid =
        questionText.trim() &&
        options.every((o) => o.text.trim()) &&
        correctAnswer &&
        marks > 0;

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-1.5">
                <Label>Question {order + 1}</Label>
                <Textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter question text"
                    rows={3}
                />
            </div>

            <div className="grid gap-1.5">
                <Label>Image (optional — for equations, diagrams, graphs, figures)</Label>
                {imageUrl ? (
                    <div className="flex items-center gap-3">
                        <img src={imageUrl} alt="Question" className="h-20 rounded border object-cover" />
                        <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl(null)}>
                            Remove
                        </Button>
                    </div>
                ) : (
                    <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                )}
                {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {options.map((option, index) => (
                    <div key={option.label} className="grid gap-1.5">
                        <Label>Option {option.label}</Label>
                        <Input
                            value={option.text}
                            onChange={(e) => updateOption(index, e.target.value)}
                        />
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

            <Button
                type="button"
                className="w-full"
                disabled={!isValid || isSubmitting || isUploading}
                onClick={handleSubmit}
            >
                {isSubmitting ? "Saving..." : "Save Question & Add Next"}
            </Button>
        </div>
    );
}