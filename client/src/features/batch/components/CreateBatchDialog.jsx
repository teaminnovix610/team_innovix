import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import BatchForm from "./BatchForm";

export default function CreateBatchDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
        + Create Batch
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
        </DialogHeader>

        <BatchForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}