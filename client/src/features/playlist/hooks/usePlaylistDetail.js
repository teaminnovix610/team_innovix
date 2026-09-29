import { useQuery } from "@tanstack/react-query";

import { getPlaylistById } from "../services/playlist.service";

export default function usePlaylistDetail(id) {

    return useQuery({

        queryKey: ["playlist", id],

        queryFn: () => getPlaylistById(id),

        enabled: !!id,

    });

}