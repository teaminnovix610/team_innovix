import { useQuery } from "@tanstack/react-query";
import { getJoinToken } from "../services/liveClass.service";

export default function useJoinClass(liveClassId, device = "main") {
  return useQuery({
    queryKey: ["join-token", liveClassId, device],
    queryFn: () => getJoinToken(liveClassId, device),
    enabled: !!liveClassId,
    retry: false,
    staleTime: 0,
  });
}