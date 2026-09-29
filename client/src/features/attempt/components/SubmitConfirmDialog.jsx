import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SubmitConfirmDialog({ open, onOpenChange, summary, onConfirm, isSubmitting }) {
    const { answered, skipped, total } = summary;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit test?</DialogTitle>
                    <DialogDescription>
                        You won't be able to change your answers after submitting.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-lg border p-3">
                        <p className="text-lg font-medium text-green-600">{answered}</p>
                        <p className="text-muted-foreground">Answered</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-lg font-medium text-muted-foreground">{skipped}</p>
                        <p className="text-muted-foreground">Skipped</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-lg font-medium">{total}</p>
                        <p className="text-muted-foreground">Total</p>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}