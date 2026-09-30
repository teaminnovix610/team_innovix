import recordingService from "./recording.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class RecordingController {
  async create(req, res, next) {
    try {
      const recording = await recordingService.create(
        req.user._id,
        req.user.role,
        req.body
      );
      return res.status(HttpStatus.CREATED).json(
        new ApiResponse(HttpStatus.CREATED, "Recording added successfully", recording)
      );
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const recordings = await recordingService.getAll(req.user._id, req.user.role);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recordings fetched successfully", recordings)
      );
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const recording = await recordingService.update(
        req.user._id,
        req.user.role,
        req.params.id,
        req.body
      );
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recording updated successfully", recording)
      );
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await recordingService.delete(
        req.user._id,
        req.user.role,
        req.params.id
      );
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recording deleted successfully", result)
      );
    } catch (err) {
      next(err);
    }
  }

  async batchRecordings(req, res, next) {
    try {
      const recordings = await recordingService.getBatchRecordings(
        req.user._id,
        req.user.role,
        req.params.batchId
      );
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recordings fetched successfully", recordings)
      );
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const recording = await recordingService.getById(
        req.user._id,
        req.user.role,
        req.params.id
      );
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recording fetched successfully", recording)
      );
    } catch (err) {
      next(err);
    }
  }

  async studentRecordings(req, res, next) {
    try {
      const recordings = await recordingService.getStudentRecordings(req.user._id, req.user.role);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Recordings fetched successfully", recordings)
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new RecordingController();
