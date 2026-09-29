import api from "../../../services/api";

const whiteboardService = {
  async getWhiteboard(classId) {
    const { data } = await api.get(`/whiteboard/${classId}`);
    return data.data; // unwrap ApiResponse envelope — { classId, elements, updatedAt, updatedBy }
  },

  async saveWhiteboard(classId, elements, updatedBy) {
    const { data } = await api.put(`/whiteboard/${classId}`, {
      elements,
      updatedBy,
    });
    return data.data;
  },
};

export default whiteboardService;