import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { playlistSchema } from "../validation/playlist.schema";

import useCreatePlaylist from "../hooks/useCreatePlaylist";
import useUpdatePlaylist from "../hooks/useUpdatePlaylist";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlaylistForm({ batchId, playlist = null, closeDialog }) {

    const isEditing = !!playlist;

    const createMutation = useCreatePlaylist(batchId);
    const updateMutation = useUpdatePlaylist(batchId);

    const mutation = isEditing ? updateMutation : createMutation;

    const {

        register,

        handleSubmit,

        formState: { errors },

    } = useForm({

        resolver: zodResolver(playlistSchema),

        defaultValues: {
            title: playlist?.title || "",
        },

    });

    const onSubmit = async (data) => {

        if (isEditing) {

            await mutation.mutateAsync({
                id: playlist._id,
                data,
            });

        } else {

            await mutation.mutateAsync({
                ...data,
                batchId,
            });

        }

        closeDialog();

    };

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >

            <div>

                <Input
                    placeholder="Playlist Title (e.g. Trigonometry)"
                    {...register("title")}
                />

                <p className="text-red-500 text-sm">
                    {errors.title?.message}
                </p>

            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
            >

                {mutation.isPending
                    ? (isEditing ? "Saving..." : "Creating...")
                    : (isEditing ? "Save Changes" : "Create Playlist")}

            </Button>

        </form>

    );

}