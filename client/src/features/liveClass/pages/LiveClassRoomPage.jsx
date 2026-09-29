import { useParams, useSearchParams } from "react-router-dom";
import useJoinClass from "../hooks/useJoinClass";
import LiveClassRoom from "../components/LiveClassRoom";

export default function LiveClassRoomPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // ?device=board means this is the teacher's second connection
  // (phone camera pointed at a physical board). Defaults to "main".
  const device = searchParams.get("device") === "board" ? "board" : "main";

  const { data, isLoading, isError, error } = useJoinClass(id, device);

  if (isLoading) {
    return <div className="p-4 text-center">Joining class...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {error?.response?.data?.message ?? "Unable to join this class."}
      </div>
    );
  }

  return (
    <LiveClassRoom
  wsUrl={data.wsUrl}
  token={data.token}
  isModerator={data.isModerator}
  liveClassId={id}
/>
  );
}