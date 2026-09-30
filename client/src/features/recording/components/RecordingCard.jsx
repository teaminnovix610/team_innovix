import { ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";

import RecordingPlayer from "./RecordingPlayer";
import AddRecordingDialog from "./AddRecordingDialog";
import DeleteRecordingDialog from "./DeleteRecordingDialog";
import { getMediaActionLabel, getMediaUrl, getYouTubeVideoId } from "@/lib/media";

export default function RecordingCard({
  recording,
  batchId,
  index,
  canManage = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) {
  const showReorder = canManage && (onMoveUp || onMoveDown);
  const mediaUrl = getMediaUrl(recording);
  const youtubeVideoId = getYouTubeVideoId(recording);

  return (
    <Card className="p-3 sm:p-4 space-y-3">
      {youtubeVideoId ? (
        <RecordingPlayer videoId={youtubeVideoId} title={recording.title} />
      ) : mediaUrl ? (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${getMediaActionLabel(recording)}: ${recording.title}`}
          className="flex w-full aspect-video items-center justify-center rounded-xl bg-slate-100 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-700"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <ExternalLink size={18} /> {getMediaActionLabel(recording)}
          </span>
        </a>
      ) : (
        <div className="flex w-full aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
          Material link unavailable
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm sm:text-base line-clamp-2">
          <span className="text-muted-foreground">{index}. </span>
          {recording.title}
        </p>

        {showReorder && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Move up"
            >
              <ArrowUp size={14} />
            </button>

            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Move down"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        )}
      </div>

      {canManage && (
        <div className="flex flex-wrap gap-2 justify-end">
          <AddRecordingDialog batchId={batchId} recording={recording} />

          <DeleteRecordingDialog
            batchId={batchId}
            recordingId={recording._id}
            recordingTitle={recording.title}
          />
        </div>
      )}
    </Card>
  );
}
