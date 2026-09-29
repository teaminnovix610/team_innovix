export function getLiveClassState(liveClass) {
    // Respect explicit terminal states from the DB
    if (liveClass.status === "CANCELLED") {
        return "CANCELLED";
    }

    if (liveClass.status === "COMPLETED") {
        return "COMPLETED";
    }

    const now = new Date();
    const start = new Date(liveClass.scheduledAt);
    const end = new Date(start.getTime() + liveClass.duration * 60 * 1000);

    if (now < start) {
        return "SCHEDULED";
    }

    if (now >= start && now <= end) {
        return "LIVE";
    }

    return "COMPLETED";
}

export function getRemainingTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}