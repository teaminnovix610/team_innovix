import { useParams, useNavigate } from "react-router-dom";

import { useBatch, useDeleteBatch } from "../hooks/useBatch";
import useAuth from "@/hooks/useAuth";

import BatchInfoCard from "../components/BatchInfoCard";
import StudentTable from "../components/StudentTable";
import DeleteBatchDialog from "../components/DeleteBatchDialog";

import ScheduleClassDialog from "../../liveClass/components/ScheduleClassDialog";
import LiveClassCard from "../../liveClass/components/LiveClassCard";
import useBatchClasses from "../../liveClass/hooks/useBatchClasses";

import RecordingsSection from "../../recording/components/RecordingsSection";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingState from "@/components/layout/LoadingState";

export default function BatchDetailsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: batch, isLoading: batchLoading } = useBatch(batchId);

  const { data: liveClasses = [], isLoading: classesLoading } =
    useBatchClasses(batchId);

  const { mutate: removeBatch, isPending: isDeleting } = useDeleteBatch();

  if (batchLoading || classesLoading || !batch) {
    return <LoadingState message="Loading batch..." />;
  }

  const isAdmin = user?.role === "ADMIN";
  const isOwnerTeacher =
    ["TEACHER", "TRAINER"].includes(user?.role) &&
    String(batch.teacherId?.userId ?? batch.teacherId) === String(user?._id);

  const canDelete = isAdmin || isOwnerTeacher;
  const canManageRecordings = isAdmin || isOwnerTeacher;

  const handleDelete = (closeDialog) => {
    removeBatch(batchId, {
      onSuccess: () => {
        closeDialog();
        navigate(isAdmin ? "/batches" : "/batches/my");
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Batch Information + Schedule action, stacked on all screen sizes */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <BatchInfoCard batch={batch} />

        <ScheduleClassDialog batchId={batchId} />
      </div>

      {/* Live Classes Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Live Classes</h2>
      </div>

      {/* Live Classes List */}
      {liveClasses.length === 0 ? (
        <div className="border rounded-lg p-6 sm:p-8 text-center text-muted-foreground">
          No live classes scheduled yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {liveClasses.map((liveClass) => (
            <LiveClassCard key={liveClass._id} liveClass={liveClass} />
          ))}
        </div>
      )}

      {/* Recordings */}
      <RecordingsSection batchId={batchId} canManage={canManageRecordings} />

      {/* Students — pushed to the bottom since this list grows the longest */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Students</h2>

        <StudentTable students={batch.students || []} />
      </div>

      {/* Danger Zone */}
      {canDelete && (
        <Card className="ring-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">Delete this batch</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, this batch cannot be recovered.
              </p>
            </div>
            <DeleteBatchDialog
              batchName={batch.name}
              onConfirm={handleDelete}
              isDeleting={isDeleting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
