import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import RecordingForm from "./RecordingForm";

export default function AddRecordingDialog({ batchId, recording = null }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" size="sm" />}>
        {recording ? "Edit Recording" : "+ Add Recording"}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{recording ? "Edit Recording" : "Add Recording"}</DialogTitle>
        </DialogHeader>

        <RecordingForm
          batchId={batchId}
          recording={recording}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}