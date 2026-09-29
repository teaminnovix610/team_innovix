import { useQuery } from "@tanstack/react-query";

import { getBatchPlaylists } from "../services/playlist.service";

export default function useBatchPlaylists(batchId) {

    return useQuery({

        queryKey: ["batchPlaylists", batchId],

        queryFn: () => getBatchPlaylists(batchId),

        enabled: !!batchId,

    });

}