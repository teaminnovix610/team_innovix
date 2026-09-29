import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAttempt, submitGuestAttempt } from "../services/attempt.service";
import { getGuestToken } from "./useGuestToken";

export function useSubmitAttempt(attemptId, mode) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            mode === "guest"
                ? submitGuestAttempt(attemptId, getGuestToken(attemptId))
                : submitAttempt(attemptId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attempt", attemptId] });
        },
    });
}