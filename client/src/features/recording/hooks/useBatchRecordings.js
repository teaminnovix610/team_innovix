import { useQuery } from "@tanstack/react-query";

import { getBatchRecordings } from "../services/recording.service";

export default function useBatchRecordings(batchId) {

    return useQuery({

        queryKey: ["batchRecordings", batchId],

        queryFn: () => getBatchRecordings(batchId),

        enabled: !!batchId,

    });

}