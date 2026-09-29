import { useQuery } from "@tanstack/react-query";
import { getPublicWeeklyTests } from "../services/weeklyTest.service";

export function usePublicWeeklyTests(classLevel) {
    return useQuery({
        queryKey: ["public-weekly-tests", classLevel],
        queryFn: () => getPublicWeeklyTests(classLevel),
        enabled: !!classLevel,
    });
}

export default usePublicWeeklyTests;