import { useQuery } from "@tanstack/react-query";
import { getMyClasses, getAllClasses } from "../services/liveClass.service";
import useAuth from "@/hooks/useAuth";

export default function useMyClasses() {
    const { user } = useAuth();

    const isAdmin = user?.role === "ADMIN";

    return useQuery({
        queryKey: isAdmin ? ["all-classes"] : ["my-classes"],
        queryFn: isAdmin ? getAllClasses : getMyClasses,
        enabled: !!user,
    });
}