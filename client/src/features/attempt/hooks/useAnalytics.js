// features/attempt/hooks/useAnalytics.js
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../services/attempt.service";

export function useAnalytics(assessmentId) {
    return useQuery({
        queryKey: ["analytics", assessmentId],
        queryFn: () => getAnalytics(assessmentId),
        enabled: !!assessmentId,
    });
}

export default useAnalytics;