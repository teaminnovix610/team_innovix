import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";

import DashboardCard from "../../../components/layout/DashboardCard";
import { useMyAssessments } from "../../assessment/hooks/useMyAssessments";

import {
  BookOpen,
  ClipboardList,
  Upload,
  BarChart3,
  PlayCircle,
} from "lucide-react";

function useMyRecordings() {
  return useQuery({
    queryKey: ["trainer-recordings"],
    queryFn: async () => {
      const res = await api.get("/recordings");
      return res.data?.data ?? [];
    },
    retry: false,
  });
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { data: assessments = [] } = useMyAssessments();
  const { data: recordings = [] } = useMyRecordings();

  const publishedAssessments = assessments.filter((a) => a.status === "PUBLISHED").length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="My Questionnaires"
          value={assessments.length}
          icon={ClipboardList}
          onClick={() => navigate("/assessments")}
        />
        <DashboardCard
          title="Published Tests"
          value={publishedAssessments}
          icon={BarChart3}
          onClick={() => navigate("/assessments")}
        />
        <DashboardCard
          title="Library Resources"
          value={recordings.length}
          icon={PlayCircle}
          onClick={() => navigate("/trainer-library")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/assessments/create")}
            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <ClipboardList className="text-blue-600" size={20} />
            <div>
              <p className="font-medium text-sm">Create Questionnaire</p>
              <p className="text-xs text-muted-foreground">MCQ with deadline</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/trainer-library")}
            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <Upload className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-sm">Upload Resources</p>
              <p className="text-xs text-muted-foreground">Lectures, PPT, study material</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/assessments")}
            className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <BarChart3 className="text-orange-600" size={20} />
            <div>
              <p className="font-medium text-sm">Monitor Performance</p>
              <p className="text-xs text-muted-foreground">Trainee participation & scores</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <BookOpen className="text-purple-600" size={20} />
            <div>
              <p className="font-medium text-sm">My Profile</p>
              <p className="text-xs text-muted-foreground">Specializations & bio</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent resources */}
      {recordings.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Library (Recent)</h2>
            <button
              onClick={() => navigate("/trainer-library")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recordings.slice(0, 5).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.type?.replace("_", " ").toLowerCase()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
