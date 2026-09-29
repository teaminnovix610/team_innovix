import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { reorderPlaylist } from "../services/playlist.service";

export default function useReorderPlaylist(playlistId) {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: (recordingIds) => reorderPlaylist(playlistId, recordingIds),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ["playlist", playlistId],
            });

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to reorder — refreshing list."
            );

            queryClient.invalidateQueries({
                queryKey: ["playlist", playlistId],
            });

        },

    });

}