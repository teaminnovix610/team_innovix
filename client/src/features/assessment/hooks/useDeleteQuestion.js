import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuestion } from "../services/assessment.service";

export function useDeleteQuestion(assessmentId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId) => deleteQuestion(assessmentId, questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
        },
    });
}

export default useDeleteQuestion;