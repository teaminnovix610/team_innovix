import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyles = {
    ANSWERED: "bg-green-600 text-white hover:bg-green-600/90",
    SKIPPED: "bg-muted text-muted-foreground",
    CURRENT: "ring-2 ring-primary",
};

export default function QuestionPalette({ questions, answers, currentIndex, onNavigate }) {
    return (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {questions.map((question, index) => {
                const answer = answers.find((a) => a.questionId === question._id);
                const isAnswered = answer?.status === "ANSWERED";
                const isCurrent = index === currentIndex;

                return (
                    <Button
                        key={question._id}
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        className={cn(
                            isAnswered ? statusStyles.ANSWERED : statusStyles.SKIPPED,
                            isCurrent && statusStyles.CURRENT
                        )}
                        onClick={() => onNavigate(index)}
                    >
                        {index + 1}
                    </Button>
                );
            })}
        </div>
    );
}