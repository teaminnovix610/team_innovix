import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBatch } from "../services/batch.service";
import { toast } from "sonner";

export default function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatch,

    onSuccess: async (newBatch) => {
      toast.success(newBatch.teacherId ? "Course assigned" : "Batch created");

      // Admin assignments change a specific trainer's server-side list, so
      // invalidate the prefix to refresh any cached trainer list on this client.
      await queryClient.invalidateQueries({
        queryKey: ["my-batches"],
      });
      await queryClient.invalidateQueries({ queryKey: ["all-batches"] });
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ?? "Unable to create batch"
      );
    },
  });
}
