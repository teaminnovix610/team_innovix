import assessmentRepository from "./assessment.repository.js";
import attemptRepository from "../attempt/attempt.repository.js";

import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import User from "../../models/User.model.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import { attachTimeStatus, getAssessmentTimeStatus } from "../../shared/utils/assessmentTime.js";

/**
 * Finds or auto-creates a TeacherProfile for a given userId.
 * Works for both legacy TEACHER and new TRAINER roles.
 */
async function resolveTeacherProfile(userId) {
  let teacher = await Teacher.findOne({ userId });
  if (!teacher) {
    // TRAINER users don't go through old approval flow — auto-create profile
    const user = await User.findById(userId);
    if (!user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found");

    teacher = await Teacher.create({
      userId,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      isApproved: user.isApproved !== false, // respect admin approval
    });
  }
  return teacher;
}

class AssessmentService {
  async createAssessment(userId, data) {
    const teacher = await resolveTeacherProfile(userId);

    if (!teacher.isApproved) {
      throw new ApiError(HttpStatus.FORBIDDEN, "Your account is pending admin approval");
    }

    return assessmentRepository.create({
      ...data,
      teacherId: teacher._id,
    });
  }

  async _recalculateTotalMarks(assessmentId) {
    const questions = await assessmentRepository.findQuestionsByAssessment(assessmentId, false);
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await assessmentRepository.updateById(assessmentId, { totalMarks });
    return totalMarks;
  }

  _assertEditable(assessment) {
    if (assessment.status === "DRAFT") return; // always editable

    // Only enforce time checks if startDate is set
    if (assessment.startDate) {
      const timeStatus = getAssessmentTimeStatus(assessment);
      if (timeStatus !== "UPCOMING") {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          "This test can no longer be edited once it has started"
        );
      }
    }
  }

  async addQuestion(userId, assessmentId, data) {
    const teacher = await resolveTeacherProfile(userId);
    const assessment = await assessmentRepository.findByTeacherAndAssessment(teacher._id, assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    this._assertEditable(assessment);

    const question = await assessmentRepository.addQuestion({
      ...data,
      assessmentId,
    });

    await this._recalculateTotalMarks(assessmentId);

    return question;
  }

  async updateQuestion(userId, assessmentId, questionId, data) {
    const teacher = await resolveTeacherProfile(userId);
    const assessment = await assessmentRepository.findByTeacherAndAssessment(teacher._id, assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    this._assertEditable(assessment);

    const question = await assessmentRepository.findQuestionById(questionId);

    if (!question || question.assessmentId.toString() !== assessmentId) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Question not found");
    }

    const updated = await assessmentRepository.updateQuestion(questionId, data);

    await this._recalculateTotalMarks(assessmentId);

    return updated;
  }

  async deleteQuestion(userId, assessmentId, questionId) {
    const teacher = await resolveTeacherProfile(userId);
    const assessment = await assessmentRepository.findByTeacherAndAssessment(teacher._id, assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    this._assertEditable(assessment);

    const question = await assessmentRepository.findQuestionById(questionId);

    if (!question || question.assessmentId.toString() !== assessmentId) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Question not found");
    }

    await assessmentRepository.deleteQuestion(questionId);

    await this._recalculateTotalMarks(assessmentId);

    return true;
  }

  async publishAssessment(userId, assessmentId) {
    const teacher = await resolveTeacherProfile(userId);
    const assessment = await assessmentRepository.findByTeacherAndAssessment(teacher._id, assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(assessmentId);

    if (questions.length === 0) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Add at least one question before publishing");
    }

    return assessmentRepository.updateById(assessmentId, { status: "PUBLISHED" });
  }

  async getForBatch(batchId, userRole) {
    const isLearner = ["STUDENT", "TRAINEE"].includes(userRole?.toUpperCase());
    const filter = isLearner ? { status: { $in: ["PUBLISHED", "CLOSED"] } } : {};
    const assessments = await assessmentRepository.findByBatch(batchId, filter);
    return assessments.map(attachTimeStatus);
  }

  async getDetail(assessmentId, userRole) {
    const assessment = await assessmentRepository.findById(assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    const isLearner = ["STUDENT", "TRAINEE"].includes(userRole?.toUpperCase());
    const withAnswers = !isLearner;
    const questions = await assessmentRepository.findQuestionsByAssessment(assessmentId, withAnswers);

    return { assessment: attachTimeStatus(assessment), questions };
  }

  async getPublicWeeklyTest() {
    const assessment = await assessmentRepository.findLatestPublicWeeklyTest();

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "No weekly test is currently available");
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(assessment._id, false);

    return { assessment: attachTimeStatus(assessment), questionCount: questions.length };
  }

  async getPublicWeeklyTests(classLevel) {
    if (!classLevel) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Class level is required");
    }

    const assessments = await assessmentRepository.findPublicTestsForClass(Number(classLevel));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stillRelevant = assessments.filter((assessment) => {
      if (!assessment.startDate) return true; // no date restriction
      const testDate = new Date(assessment.startDate);
      testDate.setHours(0, 0, 0, 0);
      return testDate >= todayStart;
    });

    const withCounts = await Promise.all(
      stillRelevant.map(async (assessment) => {
        const questions = await assessmentRepository.findQuestionsByAssessment(assessment._id, false);
        return { assessment: attachTimeStatus(assessment), questionCount: questions.length };
      })
    );

    return withCounts;
  }

  async getMyAssessments(userId) {
    const teacher = await resolveTeacherProfile(userId);
    const assessments = await assessmentRepository.findAllByTeacher(teacher._id);
    return assessments.map(attachTimeStatus);
  }

  async getForStudent(userId) {
    // Support both old Student model and new TRAINEE users
    let batchIds = [];
    let classLevel = null;

    const student = await Student.findOne({ userId });
    if (student) {
      batchIds = student.batchIds || [];
      classLevel = Number(student.classLevel);
    }

    // For TRAINEE users with no Student record, return all published assessments
    const assessments = batchIds.length > 0
      ? await assessmentRepository.findForStudent(batchIds, classLevel)
      : await assessmentRepository.findAllPublished();

    const withTimeStatus = assessments.map(attachTimeStatus);

    // Try to get attempt results if student profile exists
    let resultMap = new Map();
    if (student) {
      const results = await attemptRepository.findResultsByStudentForAssessments(
        student._id,
        assessments.map((a) => a._id)
      );
      resultMap = new Map(results.map((r) => [r.assessmentId.toString(), r]));
    }

    return withTimeStatus.map((assessment) => {
      const result = resultMap.get(assessment._id.toString());
      return {
        ...assessment,
        attempted: !!result,
        myScore: result?.score ?? null,
        myTotalMarks: result?.totalMarks ?? null,
        myAttemptId: result?.attemptId ?? null,
      };
    });
  }

  async getPublicDetail(assessmentId) {
    const assessment = await assessmentRepository.findPublicById(assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(assessmentId, false);

    return { assessment: attachTimeStatus(assessment), questions };
  }
}

export default new AssessmentService();