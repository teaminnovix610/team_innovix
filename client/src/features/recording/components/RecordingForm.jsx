import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { recordingSchema } from "../validation/recording.schema";

import useCreateRecording from "../hooks/useCreateRecording";
import useUpdateRecording from "../hooks/useUpdateRecording";
import useBatchPlaylists from "@/features/playlist/hooks/useBatchPlaylists";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecordingForm({ batchId, recording = null, closeDialog }) {

    const isEditing = !!recording;

    const { data: playlists } = useBatchPlaylists(batchId);

    const createMutation = useCreateRecording(batchId);
    const updateMutation = useUpdateRecording(batchId);

    const mutation = isEditing ? updateMutation : createMutation;

    const {

        register,

        handleSubmit,

        formState: { errors },

    } = useForm({

        resolver: zodResolver(recordingSchema),

        defaultValues: {
            title: recording?.title || "",
            youtubeUrl: recording?.youtubeUrl || "",
            playlistId: recording?.playlistId?._id || recording?.playlistId || "",
        },

    });

    const onSubmit = async (data) => {

        const payload = {
            ...data,
            playlistId: data.playlistId || null,
        };

        if (isEditing) {

            await mutation.mutateAsync({
                id: recording._id,
                data: payload,
            });

        } else {

            await mutation.mutateAsync({
                ...payload,
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
                    placeholder="Topic Title (e.g. Chapter 5 — Trigonometry)"
                    {...register("title")}
                />

                <p className="text-red-500 text-sm">
                    {errors.title?.message}
                </p>

            </div>

            <div>

                <Input
                    placeholder="YouTube URL"
                    {...register("youtubeUrl")}
                />

                <p className="text-xs text-muted-foreground mt-1">
                    Paste the link after uploading to your channel
                </p>

                <p className="text-red-500 text-sm">
                    {errors.youtubeUrl?.message}
                </p>

            </div>

            <div>

                <label className="text-sm font-medium">
                    Playlist
                </label>

                <select
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("playlistId")}
                >

                    <option value="">
                        No Playlist
                    </option>

                    {(playlists ?? []).map((playlist) => (

                        <option key={playlist._id} value={playlist._id}>
                            {playlist.title}
                        </option>

                    ))}

                </select>

                <p className="text-xs text-muted-foreground mt-1">
                    Group this recording under a chapter/unit playlist, or leave ungrouped
                </p>

            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
            >

                {mutation.isPending
                    ? (isEditing ? "Saving..." : "Adding...")
                    : (isEditing ? "Save Changes" : "Add Recording")}

            </Button>

        </form>

    );

}