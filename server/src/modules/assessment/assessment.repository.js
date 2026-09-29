import Assessment from "../../models/Assessment.model.js";
import Question from "../../models/Question.model.js";

class AssessmentRepository {
  async create(data) {
    return Assessment.create(data);
  }

  async findById(assessmentId) {
    return Assessment.findById(assessmentId);
  }

  async findByBatch(batchId, filter = {}) {
    return Assessment.find({ batchId, ...filter }).sort({ startDate: 1 });
  }

  async findByTeacherAndAssessment(teacherId, assessmentId) {
    return Assessment.findOne({ _id: assessmentId, teacherId });
  }

  async updateById(assessmentId, update) {
    return Assessment.findByIdAndUpdate(assessmentId, update, { new: true });
  }

  async addQuestion(data) {
    return Question.create(data);
  }

  async findQuestionsByAssessment(assessmentId, withAnswers = true) {
    const projection = withAnswers ? {} : { correctAnswer: 0 };
    return Question.find({ assessmentId }, projection).sort({ order: 1 });
  }

  async findLatestPublicWeeklyTest() {
    return Assessment.findOne({
      audience: "PUBLIC",
      status: "PUBLISHED",
    }).sort({ startDate: -1 });
  }

  async findPublicTestsForClass(classLevel) {
    return Assessment.find({
      audience: "PUBLIC",
      status: "PUBLISHED",
      "classRange.min": { $lte: classLevel },
      "classRange.max": { $gte: classLevel },
    }).sort({ startDate: 1 });
  }

  async findAllByTeacher(teacherId) {
    return Assessment.find({ teacherId }).sort({ createdAt: -1 });
  }

  async findForStudent(batchIds, classLevel) {
    return Assessment.find({
      status: { $in: ["PUBLISHED", "CLOSED"] },
      $or: [
        { audience: "BATCH", batchId: { $in: batchIds } },
        {
          audience: "PUBLIC",
          "classRange.min": { $lte: classLevel },
          "classRange.max": { $gte: classLevel },
        },
      ],
    }).sort({ startDate: -1 });
  }
  async findAllPublished() {
    return Assessment.find({
      status: { $in: ["PUBLISHED", "CLOSED"] },
    }).sort({ createdAt: -1 });
  }

  async findPublicById(assessmentId) {
    return Assessment.findOne({
      _id: assessmentId,
      audience: { $in: ["PUBLIC", "ALL"] },
      status: "PUBLISHED",
    });
  }

  async updateQuestion(questionId, data) {
    return Question.findByIdAndUpdate(questionId, data, { new: true });
}

async deleteQuestion(questionId) {
    return Question.findByIdAndDelete(questionId);
}

async findQuestionById(questionId) {
    return Question.findById(questionId);
}
}

export default new AssessmentRepository();
