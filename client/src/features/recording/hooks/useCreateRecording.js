import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { createRecording } from "../services/recording.service";

export default function useCreateRecording(batchId) {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createRecording,

        onSuccess: (newRecording) => {

            toast.success(
                "Recording added successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["batchRecordings", batchId],
            });

            queryClient.invalidateQueries({
                queryKey: ["batchPlaylists", batchId],
            });

            if (newRecording?.playlistId) {
                queryClient.invalidateQueries({
                    queryKey: ["playlist", newRecording.playlistId],
                });
            }

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to add recording."
            );

        },

    });

}