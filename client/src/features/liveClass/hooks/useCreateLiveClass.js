import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { createLiveClass } from "../services/liveClass.service";

export default function useCreateLiveClass() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createLiveClass,

        onSuccess: () => {

            toast.success(
                "Live class scheduled successfully."
            );

            queryClient.invalidateQueries({
                queryKey: ["batchClasses"],
            });

            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });

        },

        onError: (error) => {

            toast.error(
                error.response?.data?.message ||
                "Unable to schedule class."
            );

        },

    });

}