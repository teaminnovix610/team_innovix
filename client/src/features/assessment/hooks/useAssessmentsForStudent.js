import { useQuery } from "@tanstack/react-query";
import { getAssessmentsForStudent } from "../services/assessment.service";

export function useAssessmentsForStudent() {
    return useQuery({
        queryKey: ["assessments", "student"],
        queryFn: getAssessmentsForStudent,
    });
}

export default useAssessmentsForStudent;