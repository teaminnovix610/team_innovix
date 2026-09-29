import { useEffect, useState } from "react";

function combineDateAndTime(date, timeStr) {
    const d = new Date(date);
    const [hours, minutes] = timeStr.split(":").map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

export default function useLiveTimeStatus(assessment) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!assessment) {
        return { timeStatus: null, now, startDateTime: null, endDateTime: null };
    }

    const startDateTime = combineDateAndTime(assessment.startDate, assessment.startTime);
    const endDateTime = combineDateAndTime(assessment.startDate, assessment.endTime);

    let timeStatus;
    if (now < startDateTime) timeStatus = "UPCOMING";
    else if (now > endDateTime) timeStatus = "ENDED";
    else timeStatus = "LIVE";

    return { timeStatus, now, startDateTime, endDateTime };
}