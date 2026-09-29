import api from "../../../services/api";

export const uploadQuestionImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.data; // { imageUrl }
};