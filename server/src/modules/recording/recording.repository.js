import Recording from "../../models/Recording.model.js";

class RecordingRepository {
  async create(data) {
    return Recording.create(data);
  }

  async findById(id) {
    return Recording.findById(id).populate("batchId").populate("teacherId");
  }

  async findAll() {
    return Recording.find({ status: "PUBLISHED" })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: -1 });
  }

  async findByTeacher(teacherId) {
    return Recording.find({ teacherId, status: "PUBLISHED" })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: -1 });
  }

  async findAvailableToBatches(batchIds) {
    return Recording.find({
      status: "PUBLISHED",
      batchId: { $in: batchIds },
    })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: -1 });
  }

  async findByBatch(batchId) {
    return Recording.find({
      batchId,
      status: "PUBLISHED",
    })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: 1 });
  }

  async findByBatches(batchIds) {
    return Recording.find({
      batchId: { $in: batchIds },
      status: "PUBLISHED",
    })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: 1 });
  }
  async findUngroupedByBatch(batchId) {
    return Recording.find({
      batchId,
      playlistId: null,
      status: "PUBLISHED",
    })
      .populate("batchId")
      .populate("teacherId")
      .sort({ createdAt: 1 });
  }

  async update(id, data) {
    return Recording.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("batchId")
      .populate("teacherId");
  }

  async delete(id) {
    return Recording.findByIdAndDelete(id);
  }

  async deleteByBatch(batchId) {
    return Recording.deleteMany({
      batchId,
    });
  }
  async countByPlaylist(playlistId) {
    return Recording.countDocuments({ playlistId });
  }

  async updateOrder(id, order) {
    return Recording.findByIdAndUpdate(id, { order });
  }
}

export default new RecordingRepository();
