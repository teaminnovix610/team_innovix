import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../services/attempt.service";

export function useLeaderboard(assessmentId) {
    return useQuery({
        queryKey: ["leaderboard", assessmentId],
        queryFn: () => getLeaderboard(assessmentId),
        enabled: !!assessmentId,
    });
}

export default useLeaderboard;