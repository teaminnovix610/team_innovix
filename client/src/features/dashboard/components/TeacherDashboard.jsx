import { useNavigate } from "react-router-dom";

import DashboardCard from "../../../components/layout/DashboardCard";
import { useMyAssessments } from "../../assessment/hooks/useMyAssessments";

import {
    Users,
    BookOpen,
    Video,
    ClipboardList,
} from "lucide-react";

export default function TeacherDashboard({ data }) {
    const navigate = useNavigate();
    const { data: assessments } = useMyAssessments();

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <DashboardCard
                    title="Students"
                    value={data?.totalStudents ?? 0}
                    icon={Users}
                    onClick={() => navigate("/students")}
                />

                <DashboardCard
                    title="Batches"
                    value={data?.totalBatches ?? 0}
                    icon={BookOpen}
                    onClick={() => navigate("/batches")}
                />

                <DashboardCard
                    title="Today's Classes"
                    value={data?.todayClasses?.length ?? 0}
                    icon={Video}
                    onClick={() => navigate("/live-classes")}
                />

                <DashboardCard
                    title="Tests"
                    value={assessments?.length ?? 0}
                    icon={ClipboardList}
                    onClick={() => navigate("/assessments")}
                />
            </div>
        </div>
    );
}