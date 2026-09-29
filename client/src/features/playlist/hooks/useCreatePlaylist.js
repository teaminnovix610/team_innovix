import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { createPlaylist } from "../services/playlist.service";

export default function useCreatePlaylist(batchId) {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createPlaylist,

        onSuccess: () => {

            toast.success("Playlist created successfully.");

            queryClient.invalidateQueries({
                queryKey: ["batchPlaylists", batchId],
            });

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to create playlist."
            );

        },

    });

}