import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateQuestion } from "../services/assessment.service";

export function useUpdateQuestion(assessmentId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, data }) => updateQuestion(assessmentId, questionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
        },
    });
}

export default useUpdateQuestion;