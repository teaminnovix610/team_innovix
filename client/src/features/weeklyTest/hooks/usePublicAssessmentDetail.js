import { useQuery } from "@tanstack/react-query";
import { getPublicAssessmentDetail } from "../services/weeklyTest.service";

export function usePublicAssessmentDetail(assessmentId) {
    return useQuery({
        queryKey: ["public-assessment", assessmentId],
        queryFn: () => getPublicAssessmentDetail(assessmentId),
        enabled: !!assessmentId,
    });
}

export default usePublicAssessmentDetail;