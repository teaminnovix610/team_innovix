import { useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, "0");

    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export default function TestTimer({ remainingTime, onTick, onExpire }) {
    const secondsRef = useRef(remainingTime);
    const hasExpiredRef = useRef(false);

    useEffect(() => {
        secondsRef.current = remainingTime;
        hasExpiredRef.current = false;
    }, [remainingTime]);

    const tick = useCallback(() => {
        if (secondsRef.current <= 0) return;

        secondsRef.current -= 1;
        onTick(secondsRef.current);

        if (secondsRef.current <= 0 && !hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpire();
        }
    }, [onTick, onExpire]);

    useEffect(() => {
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [tick]);

    const isLow = secondsRef.current <= 300; // last 5 minutes

    return (
        <Badge variant={isLow ? "destructive" : "secondary"} className="font-mono text-sm">
            {formatTime(Math.max(secondsRef.current, 0))}
        </Badge>
    );
}