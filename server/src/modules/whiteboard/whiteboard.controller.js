import whiteboardService from "./whiteboard.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class WhiteboardController {
  async getWhiteboard(req, res) {
    const whiteboard = await whiteboardService.getByClassId(
      req.user._id,
      req.user.role,
      req.params.classId
    );

    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Whiteboard fetched successfully", whiteboard)
    );
  }

  async saveWhiteboard(req, res) {
    const whiteboard = await whiteboardService.saveElements(
      req.user._id,
      req.params.classId,
      req.validated.body.elements,
      req.validated.body.updatedBy
    );

    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Whiteboard saved successfully", whiteboard)
    );
  }
}

export default new WhiteboardController();