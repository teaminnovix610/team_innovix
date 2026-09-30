import announcementService from "./announcement.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AnnouncementController {
  async getPublicAnnouncements(req, res, next) {
    try {
      const announcements = await announcementService.getPublicAnnouncements();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Public announcements fetched", announcements)
      );
    } catch (err) {
      next(err);
    }
  }

  async getAllAnnouncements(req, res, next) {
    try {
      // Pass req.user so the service can apply role-based filtering
      const announcements = await announcementService.getAllAnnouncements(req.user);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "All announcements fetched", announcements)
      );
    } catch (err) {
      next(err);
    }
  }

  async createAnnouncement(req, res, next) {
    try {
      // Pass req.user so the service sets authorName correctly
      const announcement = await announcementService.createAnnouncement(req.body, req.user);
      return res.status(HttpStatus.CREATED).json(
        new ApiResponse(HttpStatus.CREATED, "Announcement created successfully", announcement)
      );
    } catch (err) {
      next(err);
    }
  }

  async updateAnnouncement(req, res, next) {
    try {
      const announcement = await announcementService.updateAnnouncement(
        req.params.id,
        req.body
      );
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Announcement updated", announcement)
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      await announcementService.deleteAnnouncement(req.params.id);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Announcement deleted successfully")
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new AnnouncementController();
