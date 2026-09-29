import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LiveClassForm from "./LiveClassForm";

export default function ScheduleClassDialog({ batchId }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full" />}>
        <Plus size={18} />
        Schedule Live Class
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Live Class</DialogTitle>
        </DialogHeader>

        <LiveClassForm
          batchId={batchId}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}