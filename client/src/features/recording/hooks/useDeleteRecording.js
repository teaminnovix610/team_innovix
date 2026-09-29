import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { deleteRecording } from "../services/recording.service";

export default function useDeleteRecording(batchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecording,

    onSuccess: () => {
      toast.success("Recording deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["batchRecordings", batchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["batchPlaylists", batchId],
      });

      // No playlistId available here (delete only takes the recording's id),
      // so invalidate broadly — React Query matches by prefix, so this
      // catches any open ["playlist", <id>] query without needing to know which one.
      queryClient.invalidateQueries({
        queryKey: ["playlist"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Unable to delete recording."
      );
    },
  });
}