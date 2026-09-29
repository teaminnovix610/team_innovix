import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyAssessments } from "../hooks/useMyAssessments";
import AssessmentCard from "../components/AssessmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const TABS = ["DRAFT", "PUBLISHED", "CLOSED"];

function computeIsEnded(assessment) {
    if (!assessment.startDate || !assessment.endTime) return false;

    const endDateTime = new Date(assessment.startDate);
    const [hours, minutes] = assessment.endTime.split(":").map(Number);
    endDateTime.setHours(hours, minutes, 0, 0);

    return new Date() > endDateTime;
}

export default function TeacherAssessmentListPage() {
    const { data: assessments, isLoading } = useMyAssessments();
    const [tab, setTab] = useState("PUBLISHED");
    const navigate = useNavigate();

    const grouped = useMemo(() => {
        const groups = { DRAFT: [], PUBLISHED: [], CLOSED: [] };

        for (const assessment of assessments ?? []) {
            if (assessment.status === "DRAFT") {
                groups.DRAFT.push(assessment);
                continue;
            }

            const isEnded = computeIsEnded(assessment);
            (isEnded ? groups.CLOSED : groups.PUBLISHED).push(assessment);
        }

        return groups;
    }, [assessments]);

    const visible = grouped[tab] ?? [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {TABS.map((t) => (
                        <Button
                            key={t}
                            size="sm"
                            variant={tab === t ? "default" : "outline"}
                            onClick={() => setTab(t)}
                        >
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>

                <Button className="w-full sm:w-auto" onClick={() => navigate("/assessments/create")}>
                    Create Assessment
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-lg" />
                    ))}
                </div>
            ) : visible.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {tab.toLowerCase()} tests.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visible.map((assessment) => (
                        <AssessmentCard key={assessment._id} assessment={assessment} role="TEACHER" />
                    ))}
                </div>
            )}
        </div>
    );
}