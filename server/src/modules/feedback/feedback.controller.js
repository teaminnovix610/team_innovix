import feedbackService from "./feedback.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class FeedbackController {
  async createFeedback(req, res, next) {
    try {
      const feedback = await feedbackService.createFeedback(req.body, req.user);
      return res.status(HttpStatus.CREATED).json(
        new ApiResponse(HttpStatus.CREATED, "Feedback submitted successfully", feedback)
      );
    } catch (err) {
      next(err);
    }
  }

  async getFeedback(req, res, next) {
    try {
      const { courseTitle } = req.query;
      const feedbackList = await feedbackService.getCourseFeedback(courseTitle);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Feedback list fetched", feedbackList)
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new FeedbackController();
