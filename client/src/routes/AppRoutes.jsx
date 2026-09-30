import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";

import DashboardHome from "../features/dashboard/pages/DashboardHome";

import BatchListPage from "../features/batch/pages/BatchListPage";
import BatchDetailsPage from "../features/batch/pages/BatchDetailsPage";
import BatchRecordingsPage from "../features/recording/pages/BatchRecordingsPage";
import PlaylistDetailPage from "../features/playlist/pages/PlaylistDetailPage";

import LiveClassRoomPage from "../features/liveClass/pages/LiveClassRoomPage";

import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import MyBatchPage from "../features/batch/pages/MyBatchPage";

import TeachersPage from "../features/teacher/pages/TeachersPage";
import StudentsPage from "../features/student/pages/StudentsPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import TeacherLiveClasses from "../features/liveClass/pages/TeacherLiveClasses";
import SettingsPage from "../features/settings/pages/SettingsPage";

import OnboardingPendingPage from "../features/onboarding/pages/OnboardingPendingPage";
import useAuth from "../hooks/useAuth";

// Capacity Connect New Pages
import CompetencyMappingPage from "../features/competency/pages/CompetencyMappingPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminPublishingPage from "../features/admin/pages/AdminPublishingPage";
import TrainerLibraryPage from "../features/library/pages/TrainerLibraryPage";
import LearningResourcesPage from "../features/library/pages/LearningResourcesPage";
import CourseCatalogPage from "../features/batch/pages/CourseCatalogPage";
import CertificatesPage from "../features/certificate/pages/CertificatesPage";
import SkillGapPage from "../features/skillGap/pages/SkillGapPage";

// Weekly Test (public / guest)
import WeeklyTestLandingPage from "../features/weeklyTest/pages/WeeklyTestLandingPage";
import GuestReviewLookupPage from "../features/weeklyTest/pages/GuestReviewLookupPage";
import GuestFindResultsPage from "../features/weeklyTest/pages/GuestFindResultsPage";

// Attempt (shared engine)
import AttemptPage from "../features/attempt/pages/AttemptPage";
import ResultPage from "../features/attempt/pages/ResultPage";
import AttemptReviewPage from "../features/attempt/pages/AttemptReviewPage";

// Assessment (trainer + trainee)
import StudentTestsPage from "../features/assessment/pages/StudentTestsPage";
import TeacherAssessmentListPage from "../features/assessment/pages/TeacherAssessmentListPage";
import CreateAssessmentPage from "../features/assessment/pages/CreateAssessmentPage";
import EditAssessmentQuestionsPage from "../features/assessment/pages/EditAssessmentQuestionsPage";
import AssessmentAnalyticsPage from "../features/assessment/pages/AssessmentAnalyticsPage";

function DashboardGate({ children }) {
  const { user } = useAuth();

  const isPendingTeacher =
    (user?.role === "TEACHER" || user?.role === "TRAINER") && user?.isApproved === false;

  if (isPendingTeacher) {
    return <Navigate to="/onboarding-pending" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Weekly Test */}
      <Route path="/weekly-test" element={<WeeklyTestLandingPage />} />
      <Route
        path="/weekly-test/:assessmentId/attempt/:attemptId"
        element={<AttemptPage mode="guest" />}
      />
      <Route
        path="/weekly-test/:assessmentId/result"
        element={<ResultPage mode="guest" />}
      />
      <Route
        path="/weekly-test/:assessmentId/find-my-result"
        element={<GuestReviewLookupPage />}
      />
      <Route
        path="/weekly-test/results/:attemptId/review"
        element={<AttemptReviewPage mode="guest" />}
      />
      <Route
        path="/weekly-test/find-my-results"
        element={<GuestFindResultsPage />}
      />

      {/* Onboarding */}
      <Route
        path="/onboarding-pending"
        element={
          <ProtectedRoute>
            <OnboardingPendingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes inside Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardGate>
              <DashboardLayout />
            </DashboardGate>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />

        <Route
          path="/competency-mapping"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CompetencyMappingPage />
            </ProtectedRoute>
          }
        />

        {/* Course Catalog (accessible to all authenticated users) */}
        <Route path="/courses" element={<CourseCatalogPage />} />

        {/* Certifications Hub (accessible to all authenticated users) */}
        <Route path="/certificates" element={<CertificatesPage />} />
        {/* Skill Gap & Learning Roadmap (Trainee) */}
        <Route
          path="/skill-gap"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT"]}>
              <SkillGapPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/publishing"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPublishingPage />
            </ProtectedRoute>
          }
        />

        {/* Trainer Pages */}
        <Route
          path="/trainer-library"
          element={
            <ProtectedRoute allowedRoles={["TRAINER", "TEACHER", "ADMIN"]}>
              <TrainerLibraryPage />
            </ProtectedRoute>
          }
        />

        {/* Trainee Pages */}
        <Route
          path="/learning-resources"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT", "ADMIN"]}>
              <LearningResourcesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/batches" element={<BatchListPage />} />
        <Route path="/batches/:batchId" element={<BatchDetailsPage />} />
        <Route
          path="/batches/:batchId/recordings"
          element={<BatchRecordingsPage />}
        />
        <Route
          path="/batches/:batchId/playlists/:playlistId"
          element={<PlaylistDetailPage />}
        />

        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/my-batch" element={<MyBatchPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/live-classes" element={<TeacherLiveClasses />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Trainee — test taking */}
        <Route
          path="/tests"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT"]}>
              <StudentTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:assessmentId/attempt/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT"]}>
              <AttemptPage mode="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT"]}>
              <ResultPage mode="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:attemptId/review"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE", "STUDENT"]}>
              <AttemptReviewPage mode="student" />
            </ProtectedRoute>
          }
        />

        {/* Trainer — assessment authoring */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={["TRAINER", "TEACHER"]}>
              <TeacherAssessmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute allowedRoles={["TRAINER", "TEACHER"]}>
              <CreateAssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:assessmentId/questions"
          element={
            <ProtectedRoute allowedRoles={["TRAINER", "TEACHER"]}>
              <EditAssessmentQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:assessmentId/results"
          element={
            <ProtectedRoute allowedRoles={["TRAINER", "TEACHER"]}>
              <AssessmentAnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Live class room */}
      <Route
        path="/live-class/:id/room"
        element={
          <ProtectedRoute>
            <LiveClassRoomPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect Unknown Routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
