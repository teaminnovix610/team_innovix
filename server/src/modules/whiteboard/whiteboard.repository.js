import Whiteboard from "../../models/Whiteboard.model.js";

class WhiteboardRepository {
  async findByClassId(classId) {
    return Whiteboard.findOne({ classId });
  }

  async upsert(classId, elements, updatedBy) {
    return Whiteboard.findOneAndUpdate(
      { classId },
      { elements, updatedBy },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }
}

export default new WhiteboardRepository();