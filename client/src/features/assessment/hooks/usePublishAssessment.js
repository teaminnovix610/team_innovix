import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishAssessment } from "../services/assessment.service";

export function usePublishAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishAssessment,
    onSuccess: (assessment) => {
      queryClient.invalidateQueries({
        queryKey: ["assessment", assessment._id],
      });
      queryClient.invalidateQueries({ queryKey: ["assessments", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["assessments", "student"] });
    },
  });
}

export default usePublishAssessment;