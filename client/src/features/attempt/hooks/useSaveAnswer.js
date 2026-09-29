import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAnswer, saveGuestAnswer } from "../services/attempt.service";
import { getGuestToken } from "./useGuestToken";

export function useSaveAnswer(attemptId, mode) {
    return useMutation({
        mutationFn: (payload) =>
            mode === "guest"
                ? saveGuestAnswer(attemptId, getGuestToken(attemptId), payload)
                : saveAnswer(attemptId, payload),
    });
}