import SkillGap from "../../models/SkillGap.model.js";
import Roadmap from "../../models/Roadmap.model.js";
import Recording from "../../models/Recording.model.js";
import Attempt from "../../models/Attempt.model.js";
import Student from "../../models/Student.model.js";
import Assessment from "../../models/Assessment.model.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

function computeSeverity(currentScore, targetScore) {
  const gap = targetScore - currentScore;
  if (gap <= 0) return "NONE";
  if (gap <= 15) return "LOW";
  if (gap <= 30) return "MODERATE";
  return "CRITICAL";
}

class SkillGapService {
  /**
   * Recompute skill gaps for a trainee based on all their submitted attempts.
   * Called after each assessment submission.
   */
  async recomputeForTrainee(userId) {
    const student = await Student.findOne({ userId });
    if (!student) return;

    // Get all submitted attempts for this student
    const attempts = await Attempt.find({
      studentId: student._id,
      status: "SUBMITTED",
    }).populate("assessmentId");

    if (!attempts.length) return;

    // Group by subject
    const subjectMap = new Map();

    for (const attempt of attempts) {
      const assessment = attempt.assessmentId;
      if (!assessment || !assessment.subject) continue;

      const subject = assessment.subject;
      const pct =
        assessment.totalMarks > 0
          ? Math.round((attempt.score / assessment.totalMarks) * 100)
          : 0;

      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { scores: [], count: 0 });
      }
      const entry = subjectMap.get(subject);
      entry.scores.push(pct);
      entry.count++;
    }

    const upsertOps = [];

    for (const [subject, { scores, count }] of subjectMap.entries()) {
      const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
      const severity = computeSeverity(avg, 70);

      // Find recommended resources for this subject
      const recs = await Recording.find({
        subject: { $regex: subject, $options: "i" },
        status: "PUBLISHED",
      })
        .limit(3)
        .select("_id title videoUrl fileUrl type");

      const recommendedResources = recs.map((r) => ({
        recordingId: r._id,
        title: r.title,
        url: r.videoUrl || r.fileUrl || "",
        type: r.type,
      }));

      upsertOps.push(
        SkillGap.findOneAndUpdate(
          { traineeId: userId, subject, topic: "" },
          {
            currentScore: avg,
            attemptsCount: count,
            gapSeverity: severity,
            recommendedResources,
            lastUpdated: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      );
    }

    await Promise.all(upsertOps);
    await this._regenerateRoadmap(userId);
  }

  async getMySkillGaps(userId) {
    return SkillGap.find({ traineeId: userId }).sort({ gapSeverity: 1 });
  }

  async getMyRoadmap(userId) {
    return Roadmap.findOne({ traineeId: userId });
  }

  /**
   * Regenerate a personalized roadmap based on skill gaps.
   */
  async _regenerateRoadmap(userId) {
    const gaps = await SkillGap.find({
      traineeId: userId,
      gapSeverity: { $in: ["CRITICAL", "MODERATE", "LOW"] },
    }).sort({ gapSeverity: 1 });

    if (!gaps.length) return;

    const steps = [];
    let order = 1;

    for (const gap of gaps) {
      // Add resource steps for recommended resources
      for (const rec of gap.recommendedResources) {
        steps.push({
          order: order++,
          title: `Study: ${rec.title}`,
          description: `Improve your ${gap.subject} skills. Current score: ${gap.currentScore}%, Target: 70%`,
          subject: gap.subject,
          topic: gap.topic,
          type: "RESOURCE",
          referenceId: rec.recordingId || null,
          referenceUrl: rec.url,
          isCompleted: false,
        });
      }

      // Add a practice assessment step
      const relatedAssessment = await Assessment.findOne({
        subject: { $regex: gap.subject, $options: "i" },
        status: "PUBLISHED",
      }).select("_id title");

      if (relatedAssessment) {
        steps.push({
          order: order++,
          title: `Practice Assessment: ${relatedAssessment.title}`,
          description: `Test your understanding of ${gap.subject}`,
          subject: gap.subject,
          topic: gap.topic,
          type: "ASSESSMENT",
          referenceId: relatedAssessment._id,
          isCompleted: false,
        });
      }
    }

    await Roadmap.findOneAndUpdate(
      { traineeId: userId },
      {
        steps,
        generatedAt: new Date(),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Mark a roadmap step as complete
   */
  async completeStep(userId, stepOrder) {
    const roadmap = await Roadmap.findOne({ traineeId: userId });
    if (!roadmap) throw new ApiError(HttpStatus.NOT_FOUND, "Roadmap not found");

    const step = roadmap.steps.find((s) => s.order === stepOrder);
    if (!step) throw new ApiError(HttpStatus.NOT_FOUND, "Step not found");

    step.isCompleted = true;
    step.completedAt = new Date();
    roadmap.lastUpdated = new Date();
    await roadmap.save();
    return roadmap;
  }
}

export default new SkillGapService();
