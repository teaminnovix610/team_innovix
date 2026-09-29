import { useQuery } from "@tanstack/react-query";
import { getMyAssessments } from "../services/assessment.service";

export function useMyAssessments() {
    return useQuery({
        queryKey: ["assessments", "mine"],
        queryFn: getMyAssessments,
    });
}

export default useMyAssessments;