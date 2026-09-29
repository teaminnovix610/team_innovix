import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyBatches, getBatches, getBatch, getStudentBatches, deleteBatch } from "../services/batch.service";
import useAuth from "@/hooks/useAuth";

export function useBatches() {
    const { user } = useAuth();

    const isAdmin = user?.role === "ADMIN";

    return useQuery({
        queryKey: isAdmin ? ["all-batches"] : ["my-batches"],
        queryFn: isAdmin ? getBatches : getMyBatches,
        enabled: !!user,
    });
}

export function useBatch(batchId) {
    return useQuery({
        queryKey: ["batch", batchId],
        queryFn: () => getBatch(batchId),
        enabled: !!batchId,
    });
}

export function useStudentBatches(enabled = true) {
    return useQuery({
        queryKey: ["student-batches"],
        queryFn: getStudentBatches,
        enabled,
    });
}

export function useDeleteBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-batches"] });
            queryClient.invalidateQueries({ queryKey: ["all-batches"] });
        },
    });
}

export default useBatches;