import { useQuery } from "@tanstack/react-query";
import { getAttemptReview, getGuestAttemptReview } from "../services/attempt.service";
import { getGuestToken } from "./useGuestToken";

export function useAttemptReview(attemptId, mode) {
    return useQuery({
        queryKey: ["attempt-review", attemptId],
        queryFn: () =>
            mode === "guest"
                ? getGuestAttemptReview(attemptId, getGuestToken(attemptId))
                : getAttemptReview(attemptId),
        enabled: !!attemptId,
    });
}

export default useAttemptReview;