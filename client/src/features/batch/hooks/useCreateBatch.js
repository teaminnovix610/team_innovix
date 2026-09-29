import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBatch } from "../services/batch.service";
import { toast } from "sonner";

export default function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatch,

    onSuccess: async (newBatch) => {
      toast.success("Batch created");

      // Instantly update the cache
      queryClient.setQueryData(["my-batches"], (old = []) => [
        ...old,
        newBatch,
      ]);

      // Also refetch in the background to stay in sync
      await queryClient.invalidateQueries({
        queryKey: ["my-batches"],
      });
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ?? "Unable to create batch"
      );
    },
  });
}