import playlistService from "./playlist.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class PlaylistController {

    async create(req, res) {

        const playlist =
            await playlistService.create(
                req.user._id,
                req.validated.body
            );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(
                HttpStatus.CREATED,
                "Playlist created successfully",
                playlist
            )
        );

    }

    async update(req, res) {

        const playlist =
            await playlistService.update(
                req.user._id,
                req.user.role,
                req.params.id,
                req.validated.body
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Playlist updated successfully",
                playlist
            )
        );

    }

    async remove(req, res) {

        const result =
            await playlistService.delete(
                req.user._id,
                req.user.role,
                req.params.id
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Playlist deleted successfully",
                result
            )
        );

    }

    async batchPlaylists(req, res) {

        const playlists =
            await playlistService.getBatchPlaylists(
                req.user._id,
                req.user.role,
                req.params.batchId
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Playlists fetched successfully",
                playlists
            )
        );

    }

    async getById(req, res) {

        const result =
            await playlistService.getById(
                req.user._id,
                req.user.role,
                req.params.id
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Playlist fetched successfully",
                result
            )
        );

    }
    async reorder(req, res) {

    const recordings =
        await playlistService.reorder(
            req.user._id,
            req.user.role,
            req.params.id,
            req.validated.body.recordingIds
        );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(
            HttpStatus.OK,
            "Playlist reordered successfully",
            recordings
        )
    );

}

}

export default new PlaylistController();