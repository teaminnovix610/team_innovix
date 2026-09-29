import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useBatches } from "../../batch/hooks/useBatch";

export default function AudienceToggle({ formData, onChange }) {
    const { data: batches } = useBatches();

    const handleBatchChange = (batchId) => {
        const selectedBatch = batches?.find((b) => b._id === batchId);
        onChange({
            batchId,
            classLevel: selectedBatch?.classLevel ?? "",
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-1.5">
                <Label>Audience</Label>
                <Select
                    value={formData.audience}
                    onValueChange={(value) => onChange({ audience: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BATCH">Batch Test</SelectItem>
                        <SelectItem value="PUBLIC">Public plus Batch Test</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.audience === "BATCH" && (
                <div className="grid gap-1.5">
                    <Label>Batch</Label>
                    <Select value={formData.batchId} onValueChange={handleBatchChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select batch">
                                {(value) => batches?.find((b) => b._id === value)?.name ?? "Select batch"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {batches?.map((batch) => (
                                <SelectItem key={batch._id} value={batch._id}>
                                    {batch.name} (Class {batch.classLevel})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {formData.classLevel && (
                        <p className="text-xs text-muted-foreground">
                            Class level set to {formData.classLevel}, from this batch.
                        </p>
                    )}
                </div>
            )}

            {formData.audience === "PUBLIC" && (
                <div className="grid gap-1.5">
                    <Label>Class</Label>
                    <Input
                        type="number"
                        value={formData.publicClassLevel || ""}
                        onChange={(e) => onChange({ publicClassLevel: e.target.value })}
                        placeholder="e.g. 8"
                    />
                </div>
            )}
        </div>
    );
}