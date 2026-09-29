import { useQuery } from "@tanstack/react-query";
import { getAssessmentsForBatch } from "../services/assessment.service";

export function useAssessmentsForBatch(batchId) {
    return useQuery({
        queryKey: ["assessments", "batch", batchId],
        queryFn: () => getAssessmentsForBatch(batchId),
        enabled: !!batchId,
    });
}

export default useAssessmentsForBatch;