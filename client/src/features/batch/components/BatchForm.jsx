import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { batchSchema } from "../validation/batch.schema";

import useCreateBatch from "../hooks/useCreateBatch";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BatchForm({ closeDialog }) {

    const mutation = useCreateBatch();

    const {

        register,

        handleSubmit,

        formState: { errors },

    } = useForm({

        resolver: zodResolver(batchSchema),

    });

    const onSubmit = async (data) => {

        await mutation.mutateAsync(data);

        closeDialog();

    };

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >

            <div>

                <Input
                    placeholder="Batch Name (e.g. Math 10A, Science 10 Evening)"
                    {...register("name")}
                />

                <p className="text-xs text-muted-foreground mt-1">
                    Include the subject here — e.g. "Math Batch A"
                </p>

                <p className="text-red-500 text-sm">

                    {errors.name?.message}

                </p>

            </div>

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
                disabled={mutation.isPending}
            >

                {mutation.isPending
                    ? "Creating..."
                    : "Create Batch"}

            </Button>

        </form>

    );

}