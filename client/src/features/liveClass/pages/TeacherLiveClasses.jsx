import useMyClasses from "../hooks/useMyClasses";
import LiveClassCard from "../components/LiveClassCard";
import { getLiveClassState } from "@/utils/liveClass";

import LoadingState from "@/components/layout/LoadingState";

export default function TeacherLiveClasses() {
    const { data: classes, isLoading, isError } = useMyClasses();

    if (isLoading) {
        return <LoadingState message="Loading your classes..." />;
    }

    if (isError) {
        return (
            <div className="text-muted-foreground text-center py-12">
                Unable to load your classes.
            </div>
        );
    }

    const visible = (classes ?? []).filter((c) => {
        const state = getLiveClassState(c);
        return state !== "COMPLETED" && state !== "CANCELLED";
    });

    const sorted = [...visible].sort((a, b) => {
        const aLive = getLiveClassState(a) === "LIVE";
        const bLive = getLiveClassState(b) === "LIVE";

        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;

        return new Date(a.scheduledAt) - new Date(b.scheduledAt);
    });

    return (
        <div className="space-y-6 sm:space-y-8">
            <h1 className="text-xl sm:text-2xl font-bold">Live Classes</h1>

            {sorted.length === 0 ? (
                <div className="text-muted-foreground text-center py-12">
                    You have no scheduled classes yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {sorted.map((liveClass) => (
                        <LiveClassCard key={liveClass._id} liveClass={liveClass} />
                    ))}
                </div>
            )}
        </div>
    );
}