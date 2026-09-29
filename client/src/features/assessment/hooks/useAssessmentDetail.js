import { useQuery } from "@tanstack/react-query";
import { getAssessment } from "../services/assessment.service";

export function useAssessmentDetail(assessmentId) {
    return useQuery({
        queryKey: ["assessment", assessmentId],
        queryFn: () => getAssessment(assessmentId),
        enabled: !!assessmentId,
    });
}

export default useAssessmentDetail;