import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useStartAttempt } from "../../attempt/hooks/useStartAttempt";
import TimeStatusBadge from "./TimeStatusBadge";
import useLiveTimeStatus from "@/hooks/useLiveTimeStatus";

const statusVariant = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CLOSED: "outline",
};

export default function AssessmentCard({ assessment, role }) {
  const navigate = useNavigate();
  const { mutate: startAttempt, isPending: isStarting } = useStartAttempt(
    assessment._id,
    "student"
  );
  const { timeStatus } = useLiveTimeStatus(assessment);

  const {
    _id,
    title,
    subject,
    audience,
    duration,
    totalMarks,
    startDate,
    status,
    attempted,
    myScore,
    myTotalMarks,
  } = assessment;

  const handleTeacherAction = () => {
    if (status === "DRAFT") {
      navigate(`/assessments/${_id}/questions`);
    }
    else {
      navigate(`/assessments/${_id}/results`);
    }
  };

  const handleEditClick = () => {
    navigate(`/assessments/${_id}/questions`);
  };

  const handleAction = () => {
    if (attempted) return;

    startAttempt(undefined, {
      onSuccess: (data) => {
        navigate(`/tests/${_id}/attempt/${data.attempt._id}`);
      },
    });
  };

  const canStudentAttempt =
    status === "PUBLISHED" && timeStatus === "LIVE" && !attempted;
  const isEnded = timeStatus === "ENDED";

  const studentButtonLabel = isStarting
    ? "Starting..."
    : status !== "PUBLISHED"
    ? "Locked"
    : timeStatus === "UPCOMING"
    ? "Not Started Yet"
    : timeStatus === "ENDED"
    ? "Ended"
    : attempted
    ? "Already Attempted"
    : "Attempt";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subject}</p>
        </div>
        {role === "TEACHER" && (
          <Badge variant={statusVariant[status] ?? "secondary"}>{status}</Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{duration} mins</span>
          <span>{totalMarks} marks</span>
          <span>{new Date(startDate).toLocaleDateString()}</span>
          {audience === "PUBLIC" && <Badge variant="outline">Public</Badge>}
        </div>

        {status === "PUBLISHED" && !isEnded && (
          <TimeStatusBadge assessment={assessment} />
        )}

        {role === "STUDENT" && isEnded && (
          <div>
            {attempted ? (
              <Badge className="bg-green-600 text-white hover:bg-green-600/90">
                Attempted — {myScore} / {myTotalMarks}
              </Badge>
            ) : (
              <Badge variant="outline">Not Attempted</Badge>
            )}
          </div>
        )}

        {role === "STUDENT" && isEnded && attempted && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(`/results/${assessment.myAttemptId}/review`)
            }
          >
            View Details
          </Button>
        )}

        {role === "TEACHER" ? (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant={status === "DRAFT" ? "default" : "secondary"}
              onClick={handleTeacherAction}
            >
              {status === "DRAFT" ? "Continue Editing" : "View Results"}
            </Button>
            {status === "PUBLISHED" && timeStatus === "UPCOMING" && (
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleEditClick}
              >
                Edit Test
              </Button>
            )}
          </div>
        ) : (
          <Button
            className="w-full"
            variant={canStudentAttempt ? "default" : "secondary"}
            disabled={!canStudentAttempt || isStarting}
            onClick={handleAction}
          >
            {studentButtonLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
