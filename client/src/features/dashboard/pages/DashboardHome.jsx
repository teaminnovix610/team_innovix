import useAuth from "../../../hooks/useAuth";

import AdminDashboard from "../components/AdminDashboard";
import TrainerDashboard from "../components/TrainerDashboard";
import TraineeDashboard from "../components/TraineeDashboard";

import LoadingState from "@/components/layout/LoadingState";

export default function DashboardHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const role = user?.role?.toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.firstName || user?.name || "User"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {role === "ADMIN" && "Manage users, monitor activities, and publish content."}
          {(role === "TRAINER" || role === "TEACHER") && "Upload resources, create assessments, and monitor trainees."}
          {(role === "TRAINEE" || role === "STUDENT") && "Explore learning resources, take assessments, and grow your skills."}
        </p>
      </div>

      {role === "ADMIN" && <AdminDashboard data={{}} />}
      {(role === "TRAINER" || role === "TEACHER") && <TrainerDashboard data={{}} />}
      {(role === "TRAINEE" || role === "STUDENT") && <TraineeDashboard data={{}} />}

      {/* Fallback for unrecognized role */}
      {!["ADMIN", "TRAINER", "TEACHER", "TRAINEE", "STUDENT"].includes(role) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-8 text-center">
          <p className="text-muted-foreground">
            Your role (<strong>{role}</strong>) dashboard is being set up. Please contact an administrator.
          </p>
        </div>
      )}
    </div>
  );
}