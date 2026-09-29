import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import PlaylistForm from "./PlaylistForm";

export default function PlaylistDialog({ batchId, playlist = null, trigger = null }) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button className="w-full sm:w-auto" size={playlist ? "sm" : "default"}>
      {playlist ? "Edit Playlist" : "+ New Playlist"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || defaultTrigger}>
        {!trigger && (playlist ? "Edit Playlist" : "+ New Playlist")}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{playlist ? "Edit Playlist" : "New Playlist"}</DialogTitle>
        </DialogHeader>

        <PlaylistForm
          batchId={batchId}
          playlist={playlist}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}