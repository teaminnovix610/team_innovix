import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { useBatch, useStudentBatches } from "@/features/batch/hooks/useBatch";

import RecordingsSection from "../components/RecordingsSection";

import { Button } from "@/components/ui/button";
import LoadingState from "@/components/layout/LoadingState";

export default function BatchRecordingsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStudent = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN";

  const { data: batch, isLoading: batchLoading } = useBatch(
    isStudent ? undefined : batchId
  );

  const { data: studentBatches, isLoading: studentBatchesLoading } =
    useStudentBatches(isStudent);

  const studentBatch = studentBatches?.find((b) => b._id === batchId);

  const isLoading = isStudent ? studentBatchesLoading : batchLoading;
  const batchName = isStudent ? studentBatch?.name : batch?.name;

  if (isLoading || (!isStudent && !batch) || (isStudent && !studentBatch)) {
    return <LoadingState message="Loading recordings..." />;
  }

  const isOwnerTeacher =
    !isStudent &&
    user?.role === "TEACHER" &&
    String(batch.teacherId?.userId ?? batch.teacherId) === String(user?._id);

  const canManage = isAdmin || isOwnerTeacher;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <h1 className="text-lg sm:text-2xl font-bold truncate">
        {batchName} — Recordings
      </h1>

      <RecordingsSection batchId={batchId} canManage={canManage} showAll />
    </div>
  );
}