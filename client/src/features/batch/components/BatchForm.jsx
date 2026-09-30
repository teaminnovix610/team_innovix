import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { batchSchema, assignedBatchSchema } from "../validation/batch.schema";

import useCreateBatch from "../hooks/useCreateBatch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { toast } from "sonner";

export default function BatchForm({ closeDialog, isAdmin = false }) {

    const mutation = useCreateBatch();
    const [trainers, setTrainers] = useState([]);
    const [loadingTrainers, setLoadingTrainers] = useState(true);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        api.get("/teachers")
            .then((res) => {
                if (cancelled) return;
                setTrainers((res.data?.data || []).filter(
                    (teacher) => {
                        const u = teacher.userId;
                        if (!u) return false;
                        const isTrainer = ["TRAINER", "TEACHER"].includes(u.role);
                        const isActive = u.isActive !== false;
                        const isApproved = teacher.isApproved || u.isApproved !== false;
                        return isTrainer && isActive && isApproved;
                    }
                ));
            })
            .catch(() => toast.error("Failed to load approved trainers"))
            .finally(() => { if (!cancelled) setLoadingTrainers(false); });
        return () => { cancelled = true; };
    }, [isAdmin]);

    const {

        register,

        handleSubmit,

        formState: { errors },

    } = useForm({

        resolver: zodResolver(isAdmin ? assignedBatchSchema : batchSchema),
        defaultValues: { name: "", classLevel: "1", ...(isAdmin ? { teacherId: "" } : {}) },

    });

    const onSubmit = async (data) => {

        try {
            await mutation.mutateAsync(data);
            closeDialog();
        } catch {
            // Mutation displays the API error.
        }

    };

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >

            <div>

                <Input
                    placeholder="Course / Batch Name (e.g. Oceanography, Meteorology)"
                    list="course-suggestions"
                    {...register("name")}
                />

                <p className="text-xs text-muted-foreground mt-1">
                    Include the subject here — e.g. "Math Batch A"
                </p>

                <p className="text-red-500 text-sm">

                    {errors.name?.message}

                </p>

            </div>

            {isAdmin && (
                <div>
                    <label className="text-sm font-medium" htmlFor="assigned-trainer">Assign to trainer</label>
                    <select
                        id="assigned-trainer"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={loadingTrainers || trainers.length === 0}
                        {...register("teacherId")}
                    >
                        <option value="">{loadingTrainers ? "Loading trainers…" : "Select an approved trainer"}</option>
                        {trainers.map((teacher) => {
                            const name = [teacher.userId?.firstName, teacher.userId?.lastName].filter(Boolean).join(" ");
                            return <option key={teacher._id} value={teacher._id}>{name || teacher.userId?.email || "Trainer"}</option>;
                        })}
                    </select>
                    {trainers.length === 0 && !loadingTrainers && (
                        <p className="text-xs text-muted-foreground mt-1">No active, approved trainers are available.</p>
                    )}
                    <p className="text-red-500 text-sm">{errors.teacherId?.message}</p>
                </div>
            )}

            <div>

                <Input
                    placeholder="Class Level (numbers only, e.g. 10)"
                    inputMode="numeric"
                    {...register("classLevel")}
                />

                <p className="text-xs text-muted-foreground mt-1">
                    Just the number — do not include subject or other text here
                </p>

                <p className="text-red-500 text-sm">

                    {errors.classLevel?.message}

                </p>

            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || (isAdmin && (loadingTrainers || trainers.length === 0))}
            >

                {mutation.isPending
                    ? "Creating..."
                    : (isAdmin ? "Assign Course" : "Create Batch")}

            </Button>

        </form>

    );

}
