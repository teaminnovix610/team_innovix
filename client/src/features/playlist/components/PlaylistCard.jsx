import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";

import PlaylistDialog from "./PlaylistDialog";
import DeletePlaylistDialog from "./DeletePlaylistDialog";

export default function PlaylistCard({ playlist, batchId, canManage = false }) {
  const navigate = useNavigate();

  return (
    <Card className="p-3 sm:p-4 space-y-3">
      <button
        onClick={() => navigate(`/batches/${batchId}/playlists/${playlist._id}`)}
        className="w-full aspect-video rounded-lg overflow-hidden relative group bg-slate-900"
      >
        {playlist.thumbnailVideoId ? (
          <img
            src={`https://img.youtube.com/vi/${playlist.thumbnailVideoId}/hqdefault.jpg`}
            alt={playlist.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
            No videos yet
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
          {playlist.recordingCount} video{playlist.recordingCount === 1 ? "" : "s"}
        </div>
      </button>

      <div>
        <p className="font-medium text-sm sm:text-base line-clamp-2">
          {playlist.title}
        </p>
      </div>

      {canManage && (
        <div className="flex flex-wrap gap-2 justify-end">
          <PlaylistDialog batchId={batchId} playlist={playlist} />

          <DeletePlaylistDialog
            batchId={batchId}
            playlistId={playlist._id}
            playlistTitle={playlist.title}
          />
        </div>
      )}
    </Card>
  );
}