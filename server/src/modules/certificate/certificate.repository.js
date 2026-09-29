import Certificate from "../../models/Certificate.model.js";

class CertificateRepository {
  async create(data) {
    return Certificate.create(data);
  }

  async findByTrainee(traineeId) {
    return Certificate.find({ traineeId, status: "ISSUED" }).sort({ issueDate: -1 });
  }

  async findAll(filter = {}) {
    return Certificate.find(filter).sort({ issueDate: -1 });
  }

  async findById(id) {
    return Certificate.findById(id);
  }

  async findByNumber(certificateNumber) {
    return Certificate.findOne({ certificateNumber });
  }

  async countByCourse(courseId) {
    return Certificate.countDocuments({ courseId, status: "ISSUED" });
  }

  async getStats() {
    const totalIssued = await Certificate.countDocuments({ status: "ISSUED" });
    const certificatesByCourse = await Certificate.aggregate([
      { $match: { status: "ISSUED" } },
      { $group: { _id: "$courseName", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalIssued,
      certificatesByCourse,
    };
  }
}

export default new CertificateRepository();
