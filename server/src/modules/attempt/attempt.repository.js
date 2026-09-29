import Attempt from "../../models/Attempt.model.js";
import Result from "../../models/Result.model.js";

class AttemptRepository {
  async create(data) {
    return Attempt.create(data);
  }

  async findById(attemptId) {
    return Attempt.findById(attemptId);
  }

  async findByIdWithToken(attemptId) {
    return Attempt.findById(attemptId).select("+guestToken");
  }

  async findByStudentAndAssessment(studentId, assessmentId) {
    return Attempt.find({ studentId, assessmentId }).sort({ createdAt: -1 });
  }

  async findOngoing(studentId, assessmentId) {
    return Attempt.findOne({ studentId, assessmentId, status: "IN_PROGRESS" });
  }

  async findOngoingGuest(phone, assessmentId) {
    return Attempt.findOne({ "guest.phone": phone, assessmentId, status: "IN_PROGRESS" }).select("+guestToken");
  }

  async countByStudentAndAssessment(studentId, assessmentId) {
    return Attempt.countDocuments({ studentId, assessmentId });
  }

  async countByGuestAndAssessment(phone, assessmentId) {
    return Attempt.countDocuments({ "guest.phone": phone, assessmentId });
  }

  async findAllSubmittedByAssessment(assessmentId) {
    return Attempt.find({
      assessmentId,
      status: { $in: ["SUBMITTED", "AUTO_SUBMITTED"] },
    });
  }

  async upsertResult(data) {
    return Result.findOneAndUpdate(
      { assessmentId: data.assessmentId, studentId: data.studentId ?? null, "guest.phone": data.guestPhone ?? null },
      data,
      { upsert: true, returnDocument: "after",}
    );
  }

 async getLeaderboard(assessmentId, limit = 100) {
    return Result.find({ assessmentId })
      .sort({ score: -1, submittedAt: 1 })
      .limit(limit)
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "firstName lastName" },
      });
}

async findResultsByStudentForAssessments(studentId, assessmentIds) {
    return Result.find({
      studentId,
      assessmentId: { $in: assessmentIds },
    });
}
async findByIdWithAssessment(attemptId) {
    return Attempt.findById(attemptId);
}
async findByGuestPhoneAndAssessment(phone, assessmentId) {
    return Attempt.findOne({
      "guest.phone": phone,
      assessmentId,
      status: { $in: ["SUBMITTED", "AUTO_SUBMITTED"] },
    }).sort({ submittedAt: -1 });
}
async findAllSubmittedByGuestPhone(phone) {
    return Attempt.find({
      "guest.phone": phone,
      status: { $in: ["SUBMITTED", "AUTO_SUBMITTED"] },
    })
      .populate("assessmentId")
      .sort({ submittedAt: -1 });
}
}

export default new AttemptRepository();