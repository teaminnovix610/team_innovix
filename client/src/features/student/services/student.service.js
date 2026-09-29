import api from "@/services/api";

export const getStudents = async () => {
    const res = await api.get("/students");
    return res.data.data;
};

export const getStudentById = async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data.data;
};

export const deleteStudent = async (studentId) => {
    const res = await api.delete(`/admin/students/${studentId}`);
    return res.data.data;
};