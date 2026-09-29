import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    startAttempt,
    saveAnswer,
    submitAttempt,
    startGuestAttempt,
    saveGuestAnswer,
    submitGuestAttempt,
} from "../services/attempt.service";

export function useStartAttempt(assessmentId, mode, guestInfo) {
    return useMutation({
        mutationFn: () =>
            mode === "guest"
                ? startGuestAttempt(assessmentId, guestInfo)
                : startAttempt(assessmentId),
    });
}

export function useSaveAnswer(attemptId, mode, guestPhone) {
    return useMutation({
        mutationFn: (payload) =>
            mode === "guest"
                ? saveGuestAnswer(attemptId, guestPhone, payload)
                : saveAnswer(attemptId, payload),
    });
}

export function useSubmitAttempt(attemptId, mode, guestPhone) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            mode === "guest"
                ? submitGuestAttempt(attemptId, guestPhone)
                : submitAttempt(attemptId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attempt", attemptId] });
        },
    });
}