import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudents, deleteStudent } from "../services/student.service";
export default function useStudents() {
    return useQuery({
        queryKey: ["students"],
        queryFn: getStudents,
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
    });
}