import { useQuery } from "@tanstack/react-query";

import { getBatchClasses } from "../services/liveClass.service";

export default function useBatchClasses(batchId) {

    return useQuery({

        queryKey: [
            "batchClasses",
            batchId,
        ],

        queryFn: () =>
            getBatchClasses(batchId),

        enabled: !!batchId,

    });

}