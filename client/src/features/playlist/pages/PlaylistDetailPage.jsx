import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpDown } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import usePlaylistDetail from "../hooks/usePlaylistDetail";
import useReorderPlaylist from "../hooks/useReorderPlaylist";

import RecordingCard from "@/features/recording/components/RecordingCard";
import PlaylistDialog from "../components/PlaylistDialog";

import { Button } from "@/components/ui/button";
import LoadingState from "@/components/layout/LoadingState";

export default function PlaylistDetailPage() {
  const { batchId, playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = usePlaylistDetail(playlistId);
  const reorderMutation = useReorderPlaylist(playlistId);

  const [orderedRecordings, setOrderedRecordings] = useState([]);

  useEffect(() => {
    if (data?.recordings) {
      setOrderedRecordings(data.recordings);
    }
  }, [data?.recordings]);

  if (isLoading || !data) {
    return <LoadingState message="Loading playlist..." />;
  }

  const { playlist } = data;

  const isAdmin = user?.role === "ADMIN";
  const isOwnerTeacher =
    user?.role === "TEACHER" &&
    String(playlist.teacherId?.userId ?? playlist.teacherId) === String(user?._id);

  const canManage = isAdmin || isOwnerTeacher;

  function moveItem(index, direction) {
    const newOrder = [...orderedRecordings];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

    setOrderedRecordings(newOrder);
    reorderMutation.mutate(newOrder.map((r) => r._id));
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg sm:text-2xl font-bold truncate">{playlist.title}</h1>

        {canManage && <PlaylistDialog batchId={batchId} playlist={playlist} />}
      </div>

      {canManage && orderedRecordings.length > 1 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-slate-50 border rounded-lg px-3 py-2">
          <ArrowUpDown size={14} className="shrink-0" />
          Use the ↑ / ↓ arrows on each video to rearrange the playlist order.
        </div>
      )}

      {orderedRecordings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recordings in this playlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {orderedRecordings.map((recording, index) => (
            <RecordingCard
              key={recording._id}
              recording={recording}
              batchId={batchId}
              index={index + 1}
              canManage={canManage}
              onMoveUp={() => moveItem(index, -1)}
              onMoveDown={() => moveItem(index, 1)}
              isFirst={index === 0}
              isLast={index === orderedRecordings.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}