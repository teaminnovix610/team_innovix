import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteBatchDialog({ batchName, onConfirm, isDeleting }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Batch
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Batch</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{batchName}</strong>. Students
            assigned to this batch and any scheduled live classes will not be
            automatically removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(() => setOpen(false))}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}