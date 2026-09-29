import api from "@/services/api";

export const getTeachers = async () => {
    const res = await api.get("/teachers");
    return res.data.data;
};

export const getTeacherById = async (id) => {
    const res = await api.get(`/teachers/${id}`);
    return res.data.data;
};

export const approveTeacher = async (teacherId) => {
    const res = await api.patch(`/admin/teachers/${teacherId}/approve`);
    return res.data.data;
};

export const deleteTeacher = async (teacherId) => {
    const res = await api.delete(`/admin/teachers/${teacherId}`);
    return res.data.data;
};