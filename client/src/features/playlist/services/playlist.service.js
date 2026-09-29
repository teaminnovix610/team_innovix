import api from "@/services/api";

export const createPlaylist = async (data) => {

    const res = await api.post(
        "/playlists",
        data
    );

    return res.data.data;
};

export const getBatchPlaylists = async (batchId) => {

    const res = await api.get(
        `/playlists/batch/${batchId}`
    );

    return res.data.data;
};

export const getPlaylistById = async (id) => {

    const res = await api.get(
        `/playlists/${id}`
    );

    return res.data.data;
};

export const updatePlaylist = async (id, data) => {

    const res = await api.patch(
        `/playlists/${id}`,
        data
    );

    return res.data.data;
};

export const deletePlaylist = async (id) => {

    const res = await api.delete(
        `/playlists/${id}`
    );

    return res.data.data;
};

export const reorderPlaylist = async (id, recordingIds) => {

    const res = await api.patch(
        `/playlists/${id}/reorder`,
        { recordingIds }
    );

    return res.data.data;
};