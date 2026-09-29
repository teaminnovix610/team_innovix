import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { updatePlaylist } from "../services/playlist.service";

export default function useUpdatePlaylist(batchId) {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: ({ id, data }) => updatePlaylist(id, data),

        onSuccess: (_, variables) => {

            toast.success("Playlist updated successfully.");

            queryClient.invalidateQueries({
                queryKey: ["batchPlaylists", batchId],
            });

            queryClient.invalidateQueries({
                queryKey: ["playlist", variables.id],
            });

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to update playlist."
            );

        },

    });

}