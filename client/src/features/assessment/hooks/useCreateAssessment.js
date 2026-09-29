import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssessment } from "../services/assessment.service";

export function useCreateAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAssessment,
        onSuccess: (assessment) => {
            queryClient.invalidateQueries({ queryKey: ["assessments", "mine"] });
        },
    });
}

export default useCreateAssessment;