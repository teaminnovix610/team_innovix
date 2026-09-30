import attemptRepository from "./attempt.repository.js";
import assessmentRepository from "../assessment/assessment.repository.js";
import Attempt from "../../models/Attempt.model.js";

import Student from "../../models/Student.model.js";
import skillGapService from "../skillGap/skillGap.service.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";
import { getAssessmentTimeStatus } from "../../shared/utils/assessmentTime.js";

class AttemptService {
  async startAttempt(userId, assessmentId) {
    const student = await Student.findOne({ userId });

    if (!student) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Student profile not found");
    }

    const assessment = await assessmentRepository.findById(assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    if (assessment.status !== "PUBLISHED") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This test is not open for attempts"
      );
    }

    const timeStatus = getAssessmentTimeStatus(assessment);

    if (timeStatus === "UPCOMING") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This test hasn't started yet"
      );
    }

    if (timeStatus === "ENDED") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "This test has ended");
    }

    const ongoing = await attemptRepository.findOngoing(
      student._id,
      assessmentId
    );

    if (ongoing) {
      return { attempt: ongoing, guestToken: null };
    }

    const attemptCount = await attemptRepository.countByStudentAndAssessment(
      student._id,
      assessmentId
    );

    if (attemptCount >= assessment.attemptsAllowed) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "No attempts remaining for this test"
      );
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(
      assessmentId,
      false
    );

    const attempt = await attemptRepository.create({
      studentId: student._id,
      assessmentId,
      startedAt: new Date(),
      remainingTime: assessment.duration * 60,
      answers: questions.map((q) => ({ questionId: q._id, status: "SKIPPED" })),
      status: "IN_PROGRESS",
    });

    return { attempt, guestToken: null };
  }

  async startGuestAttempt(assessmentId, { name, phone, classLevel }) {
    const assessment = await assessmentRepository.findById(assessmentId);

    if (!assessment) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Assessment not found");
    }

    if (assessment.status !== "PUBLISHED") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This test is not open for attempts"
      );
    }

    if (assessment.audience !== "PUBLIC") {
      throw new ApiError(HttpStatus.FORBIDDEN, "This test requires login");
    }

    const timeStatus = getAssessmentTimeStatus(assessment);

    if (timeStatus === "UPCOMING") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This test hasn't started yet"
      );
    }

    if (timeStatus === "ENDED") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "This test has ended");
    }

    const ongoing = await attemptRepository.findOngoingGuest(
      phone,
      assessmentId
    );

    if (ongoing) {
      return { attempt: ongoing, guestToken: ongoing.guestToken };
    }

    const attemptCount = await attemptRepository.countByGuestAndAssessment(
      phone,
      assessmentId
    );

    if (attemptCount >= assessment.attemptsAllowed) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "No attempts remaining for this test"
      );
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(
      assessmentId,
      false
    );
    const guestToken = Attempt.generateGuestToken();

    const attempt = await attemptRepository.create({
      guest: { name, phone, classLevel },
      guestToken,
      assessmentId,
      startedAt: new Date(),
      remainingTime: assessment.duration * 60,
      answers: questions.map((q) => ({ questionId: q._id, status: "SKIPPED" })),
      status: "IN_PROGRESS",
    });

    return { attempt, guestToken };
  }

  async _assertOwnsAttempt(attemptId, { userId, guestToken }) {
    if (userId) {
      const student = await Student.findOne({ userId });
      const attempt = await attemptRepository.findById(attemptId);

      if (
        !attempt ||
        !student ||
        attempt.studentId?.toString() !== student._id.toString()
      ) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this attempt");
      }

      return attempt;
    }

    if (guestToken) {
      const attempt = await attemptRepository.findByIdWithToken(attemptId);

      if (!attempt || attempt.guestToken !== guestToken) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You do not own this attempt");
      }

      return attempt;
    }

    throw new ApiError(
      HttpStatus.FORBIDDEN,
      "Unable to verify attempt ownership"
    );
  }

  async saveAnswer(
    attemptId,
    { questionId, selectedOption, remainingTime },
    owner
  ) {
    const attempt = await this._assertOwnsAttempt(attemptId, owner);

    if (attempt.status !== "IN_PROGRESS") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This attempt is already submitted"
      );
    }

    const assessment = await assessmentRepository.findById(
      attempt.assessmentId
    );
    const timeStatus = getAssessmentTimeStatus(assessment);

    if (timeStatus === "ENDED") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "This test has ended");
    }

    const answer = attempt.answers.find(
      (a) => a.questionId.toString() === questionId
    );

    if (!answer) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Question does not belong to this attempt"
      );
    }

    answer.selectedOption = selectedOption;
    answer.status = selectedOption ? "ANSWERED" : "SKIPPED";

    if (typeof remainingTime === "number") {
      attempt.remainingTime = remainingTime;
    }

    await attempt.save();

    return attempt;
  }

  async submitAttempt(attemptId, owner) {
    const attempt = await this._assertOwnsAttempt(attemptId, owner);

    if (attempt.status !== "IN_PROGRESS") {
      return attempt;
    }

    const assessment = await assessmentRepository.findById(
      attempt.assessmentId
    );
    const questions = await assessmentRepository.findQuestionsByAssessment(
      attempt.assessmentId,
      true
    );
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    for (const answer of attempt.answers) {
      const question = questionMap.get(answer.questionId.toString());

      if (!question) continue;

      if (answer.status === "SKIPPED" || !answer.selectedOption) {
        skippedCount += 1;
        continue;
      }

      if (answer.selectedOption === question.correctAnswer) {
        correctCount += 1;
        score += question.marks;
      }
      else {
        wrongCount += 1;
        if (assessment.negativeMarking?.enabled) {
          score -= assessment.negativeMarking.marksPerWrong;
        }
      }
    }

    attempt.status = "SUBMITTED";
    attempt.submittedAt = new Date();
    attempt.score = score;
    attempt.totalMarks = assessment.totalMarks;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.skippedCount = skippedCount;

    await attempt.save();

    await attemptRepository.upsertResult({
      assessmentId: attempt.assessmentId,
      studentId: attempt.studentId ?? null,
      guest: attempt.guest ?? undefined,
      guestPhone: attempt.guest?.phone,
      attemptId: attempt._id,
      score,
      totalMarks: assessment.totalMarks,
      correctCount,
      wrongCount,
      skippedCount,
      percentage: Math.round((score / assessment.totalMarks) * 100),
      submittedAt: attempt.submittedAt,
    });

    if (owner?.userId) {
      skillGapService.recomputeForTrainee(owner.userId).catch(() => {});
    }

    return attempt;
  }

  async getAttempt(attemptId, owner) {
    const attempt = await this._assertOwnsAttempt(attemptId, owner);
    attempt.guestToken = undefined; // never leak the token back out
    return attempt;
  }
  async getReview(attemptId, owner) {
    const attempt = await this._assertOwnsAttempt(attemptId, owner);

    if (attempt.status === "IN_PROGRESS") {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "This test is still in progress"
      );
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(
      attempt.assessmentId,
      true
    );
    const answerMap = new Map(
      attempt.answers.map((a) => [a.questionId.toString(), a])
    );

    const review = questions.map((question) => {
      const answer = answerMap.get(question._id.toString());

      return {
        questionId: question._id,
        questionText: question.questionText,
        isLatex: question.isLatex,
        imageUrl: question.imageUrl,
        options: question.options,
        correctAnswer: question.correctAnswer,
        marks: question.marks,
        selectedOption: answer?.selectedOption ?? null,
        wasAnswered: answer?.status === "ANSWERED",
        wasCorrect: answer?.selectedOption === question.correctAnswer,
      };
    });

    return {
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      questions: review,
    };
  }
  async getAnalytics(assessmentId) {
    const attempts = await attemptRepository.findAllSubmittedByAssessment(
      assessmentId
    );

    if (attempts.length === 0) {
      return { appeared: 0, highest: 0, average: 0, lowest: 0 };
    }

    const scores = attempts.map((a) => a.score);

    return {
      appeared: attempts.length,
      highest: Math.max(...scores),
      average: Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length
      ),
      lowest: Math.min(...scores),
    };
  }

  async getLeaderboard(assessmentId) {
    const results = await attemptRepository.getLeaderboard(assessmentId);

    return results.map((result, index) => ({
      rank: index + 1,
      student: result.studentId
        ? { name: result.studentId.userId?.fullName }
        : result.guest,
      score: result.score,
      percentage: result.percentage,
    }));
  }

  async getReviewByPhone(assessmentId, phone) {
    const attempt = await attemptRepository.findByGuestPhoneAndAssessment(phone, assessmentId);

    if (!attempt) {
      throw new ApiError(HttpStatus.NOT_FOUND, "No completed attempt found for this phone number");
    }

    if (attempt.status === "IN_PROGRESS") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "This test is still in progress");
    }

    const questions = await assessmentRepository.findQuestionsByAssessment(attempt.assessmentId, true);
    const answerMap = new Map(attempt.answers.map((a) => [a.questionId.toString(), a]));

    const review = questions.map((question) => {
      const answer = answerMap.get(question._id.toString());

      return {
        questionId: question._id,
        questionText: question.questionText,
        isLatex: question.isLatex,
        imageUrl: question.imageUrl,
        options: question.options,
        correctAnswer: question.correctAnswer,
        marks: question.marks,
        selectedOption: answer?.selectedOption ?? null,
        wasAnswered: answer?.status === "ANSWERED",
        wasCorrect: answer?.selectedOption === question.correctAnswer,
      };
    });

    return {
      attemptId: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      questions: review,
    };
}
async getGuestResultsList(phone) {
    if (!phone) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Phone number is required");
    }

    const attempts = await attemptRepository.findAllSubmittedByGuestPhone(phone);

    return attempts
      .filter((attempt) => attempt.assessmentId) // guard against a deleted assessment
      .map((attempt) => ({
        attemptId: attempt._id,
        assessmentId: attempt.assessmentId._id,
        title: attempt.assessmentId.title,
        subject: attempt.assessmentId.subject,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        submittedAt: attempt.submittedAt,
      }));
}
}

export default new AttemptService();
