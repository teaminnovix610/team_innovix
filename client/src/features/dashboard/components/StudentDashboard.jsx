import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "../../../components/layout/DashboardCard";
import { getLiveClassState } from "@/utils/liveClass";
import { useAssessmentsForStudent } from "../../assessment/hooks/useAssessmentsForStudent";

import {
  BookOpen,
  CalendarClock,
  Video,
  ClipboardList,
  PlayCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import useStudentClasses from "../../liveClass/hooks/useStudentClasses";
import useStudentRecordings from "../../recording/hooks/useStudentRecordings";
import LiveClassCard from "../../liveClass/components/LiveClassCard";

export default function StudentDashboard({ data }) {
  const navigate = useNavigate();
  const batches = data?.batches ?? [];
  const [selectedBatch, setSelectedBatch] = useState(null);
  const batchesSectionRef = useRef(null);
  const { data: recordings } = useStudentRecordings();

  const { data: assessments } = useAssessmentsForStudent();
  const availableTestsCount = (assessments ?? []).filter(
    (a) => a.status === "PUBLISHED"
  ).length;

  const scrollToBatches = () => {
    batchesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToMyClasses = () => {
    navigate("/my-batch");
  };

  const goToTests = () => {
    navigate("/tests");
  };

  const goToRecordings = () => {
    navigate(`/batches/${selectedBatch._id}/recordings`);
    setSelectedBatch(null);
  };

  const { data: classes, isLoading: classesLoading } = useStudentClasses();

  const batchClasses = selectedBatch
    ? (classes ?? [])
        .filter((liveClass) => liveClass.batchId?._id === selectedBatch._id)
        .sort((a, b) => {
          const aLive = getLiveClassState(a) === "LIVE";
          const bLive = getLiveClassState(b) === "LIVE";
          if (aLive && !bLive) return -1;
          if (!aLive && bLive) return 1;
          return new Date(a.scheduledAt) - new Date(b.scheduledAt);
        })
    : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <DashboardCard
          title="Assigned Batches"
          value={batches.length}
          icon={BookOpen}
          onClick={scrollToBatches}
        />

        <DashboardCard
          title="Today's Classes"
          value={data?.todayClasses?.length ?? 0}
          icon={Video}
          onClick={goToMyClasses}
        />

        <DashboardCard
          title="Upcoming Classes"
          value={data?.upcomingClasses?.length ?? 0}
          icon={CalendarClock}
          onClick={goToMyClasses}
        />

        <DashboardCard
          title="Recordings"
          value={recordings?.length ?? 0}
          icon={PlayCircle}
          onClick={goToMyClasses}
        />

        <DashboardCard
          title="Tests"
          value={availableTestsCount}
          icon={ClipboardList}
          onClick={goToTests}
        />
      </div>

      <div
        ref={batchesSectionRef}
        className="bg-white rounded-xl shadow p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4">My Batches</h2>

        {batches.length === 0 ? (
          <p className="text-muted-foreground">No batches assigned</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg truncate">{batch.name}</h3>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                      batch.isActive
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {batch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm">
                  Class {batch.classLevel}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedBatch(batch)}
                >
                  View Classes
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedBatch}
        onOpenChange={(open) => !open && setSelectedBatch(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate">
              {selectedBatch?.name} — Classes
            </DialogTitle>
          </DialogHeader>

          {classesLoading ? (
            <p className="text-muted-foreground text-center py-6">
              Loading classes...
            </p>
          ) : batchClasses.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No live or scheduled classes for this batch right now.
            </p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {batchClasses.map((liveClass) => (
                <LiveClassCard key={liveClass._id} liveClass={liveClass} />
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={goToRecordings}
          >
            View Recordings
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
