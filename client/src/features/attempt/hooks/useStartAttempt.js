import { useMutation } from "@tanstack/react-query";
import { startAttempt, startGuestAttempt } from "../services/attempt.service";
import { saveGuestToken } from "./useGuestToken";

export function useStartAttempt(assessmentId, mode, guestInfo) {
    return useMutation({
        mutationFn: () =>
            mode === "guest"
                ? startGuestAttempt(assessmentId, guestInfo)
                : startAttempt(assessmentId).then((attempt) => ({ attempt, guestToken: null })),
        onSuccess: (data) => {
            if (mode === "guest" && data.guestToken) {
                saveGuestToken(data.attempt._id, data.guestToken);
            }
        },
    });
}