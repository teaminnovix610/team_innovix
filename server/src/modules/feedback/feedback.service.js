import Feedback from "../../models/Feedback.model.js";

class FeedbackService {
  async createFeedback(data, user) {
    return await Feedback.create({
      ...data,
      traineeId: user._id,
      traineeName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });
  }

  async getCourseFeedback(courseTitle) {
    const filter = courseTitle ? { courseTitle } : {};
    return await Feedback.find(filter).sort({ createdAt: -1 });
  }

  async getAllFeedback() {
    return await Feedback.find().sort({ createdAt: -1 });
  }
}

export default new FeedbackService();
