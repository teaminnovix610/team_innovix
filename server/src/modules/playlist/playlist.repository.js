import Playlist from "../../models/Playlist.model.js";
import Recording from "../../models/Recording.model.js";

class PlaylistRepository {

    async create(data) {

        return Playlist.create(data);

    }

    async findById(id) {

        return Playlist.findById(id)
            .populate("batchId")
            .populate("teacherId");

    }

    async findByBatch(batchId) {

        return Playlist.find({
            batchId,
        })
            .sort({ createdAt: 1 });

    }

    async update(id, data) {

        return Playlist.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
            }
        );

    }

    async delete(id) {

        return Playlist.findByIdAndDelete(id);

    }

    // Recordings inside a deleted playlist become ungrouped, not deleted.
    async ungroupRecordings(playlistId) {

        return Recording.updateMany(
            { playlistId },
            { playlistId: null }
        );

    }

    async findRecordingsByPlaylist(playlistId) {

    return Recording.find({
        playlistId,
        status: "PUBLISHED",
    })
        .sort({ order: 1 });

}

    async countRecordingsByPlaylist(playlistId) {

        return Recording.countDocuments({
            playlistId,
            status: "PUBLISHED",
        });

    }
}

export default new PlaylistRepository();