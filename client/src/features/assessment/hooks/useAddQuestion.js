import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addQuestion } from "../services/assessment.service";

export function useAddQuestion(assessmentId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => addQuestion(assessmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
        },
    });
}

export default useAddQuestion;