import { Badge } from "@/components/ui/badge";
import useLiveTimeStatus from "@/hooks/useLiveTimeStatus";

function formatCountdown(ms) {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function TimeStatusBadge({ assessment }) {
    const { timeStatus, now, startDateTime } = useLiveTimeStatus(assessment);

    if (timeStatus === "UPCOMING") {
        return <Badge variant="secondary">Starts in {formatCountdown(startDateTime - now)}</Badge>;
    }

    if (timeStatus === "ENDED") {
        return <Badge variant="outline">Ended</Badge>;
    }

    return <Badge className="bg-green-600 text-white hover:bg-green-600/90">Live Now</Badge>;
}