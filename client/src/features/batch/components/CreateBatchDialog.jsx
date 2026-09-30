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

export default function CreateBatchDialog({ isAdmin = false }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
        {isAdmin ? "+ Assign Course to Trainer" : "+ Create Batch"}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isAdmin ? "Assign Course to Trainer" : "Create Batch"}</DialogTitle>
        </DialogHeader>

        <BatchForm isAdmin={isAdmin} closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
