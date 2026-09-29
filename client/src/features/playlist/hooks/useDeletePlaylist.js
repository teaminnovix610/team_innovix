import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { deletePlaylist } from "../services/playlist.service";

export default function useDeletePlaylist(batchId) {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: deletePlaylist,

        onSuccess: () => {

            toast.success("Playlist deleted successfully.");

            queryClient.invalidateQueries({
                queryKey: ["batchPlaylists", batchId],
            });

            queryClient.invalidateQueries({
                queryKey: ["batchRecordings", batchId],
            });

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to delete playlist."
            );

        },

    });

}