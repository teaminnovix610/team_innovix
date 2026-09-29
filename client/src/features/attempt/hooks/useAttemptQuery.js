import { useQuery } from "@tanstack/react-query";
import { getAttempt, getGuestAttempt } from "../services/attempt.service";
import { getGuestToken } from "./useGuestToken";

export function useAttemptQuery(attemptId, mode) {
    return useQuery({
        queryKey: ["attempt", attemptId],
        queryFn: () =>
            mode === "guest"
                ? getGuestAttempt(attemptId, getGuestToken(attemptId))
                : getAttempt(attemptId),
        enabled: !!attemptId,
    });
}

export default useAttemptQuery;