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

import useDeleteRecording from "../hooks/useDeleteRecording";

export default function DeleteRecordingDialog({ batchId, recordingId, recordingTitle }) {
  const [open, setOpen] = useState(false);

  const mutation = useDeleteRecording(batchId);

  const handleDelete = async () => {
    await mutation.mutateAsync(recordingId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <span className="sr-only">Delete recording</span>
        🗑
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Recording</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{recordingTitle}"? This can't be undone.
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