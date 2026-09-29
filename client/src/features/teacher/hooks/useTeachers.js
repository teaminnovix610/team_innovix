import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeachers, approveTeacher,deleteTeacher} from "../services/teacher.service";

export default function useTeachers() {
    return useQuery({
        queryKey: ["teachers"],
        queryFn: getTeachers,
    });
}

export function useApproveTeacher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: approveTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
        },
    });
};

export function useDeleteTeacher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTeacher,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
        },
    });
}