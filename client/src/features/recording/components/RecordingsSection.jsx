import { useNavigate } from "react-router-dom";

import useBatchRecordings from "../hooks/useBatchRecordings";
import useBatchPlaylists from "@/features/playlist/hooks/useBatchPlaylists";

import AddRecordingDialog from "./AddRecordingDialog";
import RecordingCard from "./RecordingCard";

import PlaylistDialog from "@/features/playlist/components/PlaylistDialog";
import PlaylistCard from "@/features/playlist/components/PlaylistCard";

import { Button } from "@/components/ui/button";

const PREVIEW_CAP = 6;

export default function RecordingsSection({ batchId, canManage = false, showAll = false }) {
  const navigate = useNavigate();

  const { data: recordings, isLoading: recordingsLoading } = useBatchRecordings(batchId);
  const { data: playlists, isLoading: playlistsLoading } = useBatchPlaylists(batchId);

  const ungrouped = (recordings ?? []).filter((r) => !r.playlistId);
  const items = showAll ? ungrouped : ungrouped.slice(0, PREVIEW_CAP);

  const isLoading = recordingsLoading || playlistsLoading;

  return (
    <div className="space-y-6">
      {/* Playlists */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-heading text-lg font-medium">Playlists</h3>

          {canManage && (
            <div className="w-full sm:w-auto">
              <PlaylistDialog batchId={batchId} />
            </div>
          )}
        </div>

        {!isLoading && (playlists ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No playlists yet.</p>
        )}

        {(playlists ?? []).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                batchId={batchId}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ungrouped recordings */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-heading text-lg font-medium">
            {(playlists ?? []).length > 0 ? "Other Recordings" : "Recordings"}
          </h3>

          {canManage && (
            <div className="w-full sm:w-auto">
              <AddRecordingDialog batchId={batchId} />
            </div>
          )}
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading recordings...</p>
        )}

        {!isLoading && ungrouped.length === 0 && (
          <p className="text-sm text-muted-foreground">No recordings yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items?.map((recording, i) => (
            <div
              key={recording._id}
              className={
                showAll
                  ? ""
                  : i < 2
                  ? ""
                  : i < 4
                  ? "hidden sm:block"
                  : "hidden lg:block"
              }
            >
              <RecordingCard
                recording={recording}
                batchId={batchId}
                index={i + 1}
                canManage={canManage}
              />
            </div>
          ))}
        </div>

        {!showAll && ungrouped.length > 2 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/batches/${batchId}/recordings`)}
            >
              View All Recordings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}