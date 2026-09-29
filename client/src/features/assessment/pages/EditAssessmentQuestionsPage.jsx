import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import QuestionForm from "../components/QuestionForm";
import QuestionEditCard from "../components/QuestionEditCard";
import { useAssessmentDetail } from "../hooks/useAssessmentDetail";
import { useAddQuestion } from "../hooks/useAddQuestion";
import { usePublishAssessment } from "../hooks/usePublishAssessment";
import useLiveTimeStatus from "@/hooks/useLiveTimeStatus";

export default function EditAssessmentQuestionsPage() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useAssessmentDetail(assessmentId);
    const { mutate: addQuestion, isPending: isAddingQuestion } = useAddQuestion(assessmentId);
    const { mutate: publishAssessment, isPending: isPublishing } = usePublishAssessment();

    const { timeStatus } = useLiveTimeStatus(data?.assessment);

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 rounded-lg" />
            </div>
        );
    }

    const { assessment, questions } = data;
    const isDraft = assessment.status === "DRAFT";
    const isPublished = assessment.status === "PUBLISHED";

    const isEditable = isDraft || (isPublished && timeStatus === "UPCOMING");

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">{assessment.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {assessment.subject} · Total marks: {assessment.totalMarks || 0}
                    </p>
                </div>
                <Badge variant={isDraft ? "secondary" : "default"}>{assessment.status}</Badge>
            </div>

            {isPublished && isEditable && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    This test is published but hasn't started yet — you can still edit it.
                    Editing locks automatically once the test begins.
                </p>
            )}

            {isPublished && !isEditable && (
                <p className="rounded-lg border border-muted bg-muted/50 p-3 text-sm text-muted-foreground">
                    This test has started or ended and can no longer be edited.
                </p>
            )}

            {questions.length > 0 && (
                <div className="space-y-2">
                    {questions.map((q, i) => (
                        <QuestionEditCard
                            key={q._id}
                            assessmentId={assessmentId}
                            question={q}
                            index={i}
                            readOnly={!isEditable}
                        />
                    ))}
                </div>
            )}

            {isEditable && (
                <QuestionForm
                    order={questions.length}
                    onAdd={addQuestion}
                    isSubmitting={isAddingQuestion}
                />
            )}

            {isDraft && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate("/assessments", { replace: true })}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        type="button"
                        className="flex-1"
                        disabled={questions.length === 0 || isPublishing}
                        onClick={() => publishAssessment(assessmentId)}
                    >
                        {isPublishing ? "Publishing..." : `Publish Test (${questions.length} questions)`}
                    </Button>
                </div>
            )}

            {isPublished && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/assessments", { replace: true })}
                >
                    Back to Tests
                </Button>
            )}
        </div>
    );
}