import playlistRepository from "./playlist.repository.js";

import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import Batch from "../../models/Batch.model.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import recordingRepository from "../recording/recording.repository.js";

async function assertBatchAccess(userId, userRole, batchId) {

    const batch = await Batch.findById(batchId);

    if (!batch) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
    }

    if (userRole === "ADMIN") {
        return batch;
    }

    if (userRole === "TEACHER") {
        const teacher = await Teacher.findOne({ userId });

        if (!teacher || batch.teacherId.toString() !== teacher._id.toString()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this batch");
        }

        return batch;
    }

    if (userRole === "STUDENT") {
        const student = await Student.findOne({ userId });

        const isEnrolled =
            student &&
            student.batchIds &&
            student.batchIds.some((id) => id.toString() === batchId.toString());

        if (!isEnrolled) {
            throw new ApiError(HttpStatus.FORBIDDEN, "You are not enrolled in this batch");
        }

        return batch;
    }

    throw new ApiError(HttpStatus.FORBIDDEN, "Unauthorized role");
}

class PlaylistService {

    async create(userId, data) {

        const teacher = await Teacher.findOne({ userId });

        if (!teacher) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Teacher profile not found");
        }

        const batch = await Batch.findById(data.batchId);

        if (!batch) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
        }

        if (batch.teacherId.toString() !== teacher._id.toString()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this batch");
        }

        return await playlistRepository.create({
            batchId: data.batchId,
            teacherId: teacher._id,
            title: data.title,
        });
    }

    async update(userId, userRole, id, data) {

        const playlist = await playlistRepository.findById(id);

        if (!playlist) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Playlist not found");
        }

        if (userRole !== "ADMIN") {
            const teacher = await Teacher.findOne({ userId });

            if (!teacher || playlist.teacherId._id.toString() !== teacher._id.toString()) {
                throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this playlist");
            }
        }

        return await playlistRepository.update(id, data);
    }

    async delete(userId, userRole, id) {

        const playlist = await playlistRepository.findById(id);

        if (!playlist) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Playlist not found");
        }

        if (userRole !== "ADMIN") {
            const teacher = await Teacher.findOne({ userId });

            if (!teacher || playlist.teacherId._id.toString() !== teacher._id.toString()) {
                throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this playlist");
            }
        }

        // Recordings inside just get ungrouped, never deleted.
        await playlistRepository.ungroupRecordings(id);
        await playlistRepository.delete(id);

        return { deleted: true };
    }

    async getBatchPlaylists(userId, userRole, batchId) {

        await assertBatchAccess(userId, userRole, batchId);

        const playlists = await playlistRepository.findByBatch(batchId);

        // Attach a recording count + first thumbnail's video id to each,
        // so the frontend card can render without a second round trip.
        const withMeta = await Promise.all(
            playlists.map(async (playlist) => {
                const recordings = await playlistRepository.findRecordingsByPlaylist(playlist._id);

                return {
                    _id: playlist._id,
                    batchId: playlist.batchId,
                    teacherId: playlist.teacherId,
                    title: playlist.title,
                    createdAt: playlist.createdAt,
                    recordingCount: recordings.length,
                    thumbnailVideoId: recordings[0]?.youtubeVideoId ?? null,
                };
            })
        );

        return withMeta;
    }

    async getById(userId, userRole, id) {

        const playlist = await playlistRepository.findById(id);

        if (!playlist) {
            throw new ApiError(HttpStatus.NOT_FOUND, "Playlist not found");
        }

        await assertBatchAccess(userId, userRole, playlist.batchId._id);

        const recordings = await playlistRepository.findRecordingsByPlaylist(id);

        return {
            playlist,
            recordings,
        };
    }
    async reorder(userId, userRole, id, recordingIds) {

    const playlist = await playlistRepository.findById(id);

    if (!playlist) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Playlist not found");
    }

    if (userRole !== "ADMIN") {
        const teacher = await Teacher.findOne({ userId });

        if (!teacher || playlist.teacherId._id.toString() !== teacher._id.toString()) {
            throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this playlist");
        }
    }

    const recordings = await playlistRepository.findRecordingsByPlaylist(id);
    const validIds = new Set(recordings.map((r) => r._id.toString()));

    const allValid = recordingIds.every((rid) => validIds.has(rid)) &&
        recordingIds.length === recordings.length;

    if (!allValid) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Recording list does not match this playlist");
    }

    await Promise.all(
        recordingIds.map((rid, index) => recordingRepository.updateOrder(rid, index))
    );

    return await playlistRepository.findRecordingsByPlaylist(id);
}
}

export default new PlaylistService();