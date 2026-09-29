import { useStudentBatches } from "../hooks/useBatch";
import useStudentClasses from "../../liveClass/hooks/useStudentClasses";
import LiveClassCard from "../../liveClass/components/LiveClassCard";

import RecordingsSection from "../../recording/components/RecordingsSection";

import LoadingState from "@/components/layout/LoadingState";

// Puts live classes first, then sorts the rest by scheduled time
function sortClasses(a, b) {
  const aLive = a.status === "LIVE";
  const bLive = b.status === "LIVE";

  if (aLive && !bLive) return -1;
  if (!aLive && bLive) return 1;

  return new Date(a.scheduledAt) - new Date(b.scheduledAt);
}

// Ranks a batch by its "best" class: live now > soonest upcoming > no relevant classes
function getBatchRank(batchClasses) {
  const hasLive = batchClasses.some((c) => c.status === "LIVE");

  const upcoming = batchClasses.filter((c) => c.status === "SCHEDULED");

  const soonestTime =
    upcoming.length > 0
      ? Math.min(...upcoming.map((c) => new Date(c.scheduledAt).getTime()))
      : Infinity;

  return { hasLive, soonestTime };
}

function sortBatches(a, b) {
  const rankA = getBatchRank(a.batchClasses);
  const rankB = getBatchRank(b.batchClasses);

  if (rankA.hasLive && !rankB.hasLive) return -1;
  if (!rankA.hasLive && rankB.hasLive) return 1;

  return rankA.soonestTime - rankB.soonestTime;
}

export default function MyBatchPage() {
  const {
    data: batches,
    isLoading: batchesLoading,
    isError: batchesError,
  } = useStudentBatches();
  const { data: classes, isLoading: classesLoading } = useStudentClasses();

  if (batchesLoading || classesLoading) {
    return <LoadingState message="Loading your classes..." />;
  }

  if (batchesError) {
    return (
      <div className="text-muted-foreground text-center py-12">
        Unable to load your classes.
      </div>
    );
  }

  // Attach each batch's sorted classes, then sort the batches themselves
  const batchesWithClasses = (batches ?? [])
    .map((batch) => ({
      ...batch,
      batchClasses: (classes ?? [])
        .filter((liveClass) => liveClass.batchId?._id === batch._id)
        .sort(sortClasses),
    }))
    .sort(sortBatches);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold">My Classes</h1>

      {batchesWithClasses.length === 0 ? (
        <div className="text-muted-foreground text-center py-12">
          You are not assigned to any batch yet.
        </div>
      ) : (
        batchesWithClasses.map((batch) => (
          <div key={batch._id} className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">{batch.name}</h2>

            {batch.batchClasses.length === 0 ? (
              <div className="border rounded-lg p-4 sm:p-6 text-center text-muted-foreground">
                No live classes scheduled yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {batch.batchClasses.map((liveClass) => (
                  <LiveClassCard key={liveClass._id} liveClass={liveClass} />
                ))}
              </div>
            )}

            <RecordingsSection batchId={batch._id} canManage={false} />
          </div>
        ))
      )}
    </div>
  );
}