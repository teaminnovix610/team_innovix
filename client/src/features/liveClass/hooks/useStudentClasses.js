import { useQuery } from "@tanstack/react-query";
import { getStudentClasses } from "../services/liveClass.service";

export default function useStudentClasses() {
    return useQuery({
        queryKey: ["student-classes"],
        queryFn: getStudentClasses,
    });
}