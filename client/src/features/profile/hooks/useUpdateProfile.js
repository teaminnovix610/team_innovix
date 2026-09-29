import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../services/profile.service";
import { toast } from "sonner";

export default function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,

        onSuccess: () => {
            toast.success("Profile updated");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },

        onError: (err) => {
            toast.error(
                err.response?.data?.message ?? "Unable to update profile"
            );
        },
    });
}