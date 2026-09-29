import { useQuery } from "@tanstack/react-query";

import { getStudentRecordings } from "../services/recording.service";

export default function useStudentRecordings() {

    return useQuery({

        queryKey: ["studentRecordings"],

        queryFn: getStudentRecordings,

    });

}