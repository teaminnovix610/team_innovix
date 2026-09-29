import { useMemo, useState } from "react";
import { useAssessmentsForStudent } from "../hooks/useAssessmentsForStudent";
import AssessmentCard from "../components/AssessmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function StudentTestsPage() {
  const { data: assessments, isLoading } = useAssessmentsForStudent();
  const [tab, setTab] = useState("available");

  const { available, completed } = useMemo(() => {
    if (!assessments) return { available: [], completed: [] };

    return {
      available: assessments.filter(
        (a) => a.timeStatus === "LIVE" || a.timeStatus === "UPCOMING"
      ),
      completed: assessments.filter((a) => a.timeStatus === "ENDED"),
    };
  }, [assessments]);

  const visible = tab === "available" ? available : completed;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={tab === "available" ? "default" : "outline"}
          onClick={() => setTab("available")}
        >
          Available
        </Button>
        <Button
          variant={tab === "completed" ? "default" : "outline"}
          onClick={() => setTab("completed")}
        >
          Completed
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tests here yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visible.map((assessment) => (
            <AssessmentCard
              key={assessment._id}
              assessment={assessment}
              role="STUDENT"
            />
          ))}
        </div>
      )}
    </div>
  );
}
