import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import useDeletePlaylist from "../hooks/useDeletePlaylist";

export default function DeletePlaylistDialog({ batchId, playlistId, playlistTitle }) {
  const [open, setOpen] = useState(false);

  const mutation = useDeletePlaylist(batchId);

  const handleDelete = async () => {
    await mutation.mutateAsync(playlistId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <span className="sr-only">Delete playlist</span>
        🗑
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Playlist</DialogTitle>
          <DialogDescription>
            Delete "{playlistTitle}"? Recordings inside will stay, moved to Ungrouped.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton>
          <DialogClose
            render={<Button variant="destructive" disabled={mutation.isPending} />}
            onClick={handleDelete}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}