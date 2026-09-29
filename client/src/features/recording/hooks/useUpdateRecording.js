import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { updateRecording } from "../services/recording.service";

export default function useUpdateRecording(batchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateRecording(id, data),

    onSuccess: (updatedRecording) => {
      toast.success("Recording updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["batchRecordings", batchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["batchPlaylists", batchId],
      });

      if (updatedRecording?.playlistId) {
        queryClient.invalidateQueries({
          queryKey: ["playlist", updatedRecording.playlistId],
        });
      }
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Unable to update recording."
      );
    },
  });
}
