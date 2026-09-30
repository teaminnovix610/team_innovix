import skillGapService from "./skillGap.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class SkillGapController {
  async getMySkillGaps(req, res) {
    const gaps = await skillGapService.getMySkillGaps(req.user._id);
    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Skill gaps fetched", gaps)
    );
  }

  async getMyRoadmap(req, res) {
    const roadmap = await skillGapService.getMyRoadmap(req.user._id);
    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Roadmap fetched", roadmap)
    );
  }

  async completeStep(req, res) {
    const { stepOrder } = req.body;
    const roadmap = await skillGapService.completeStep(req.user._id, Number(stepOrder));
    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Step marked complete", roadmap)
    );
  }

  async triggerRecompute(req, res) {
    await skillGapService.recomputeForTrainee(req.user._id);
    return res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Skill gaps recomputed")
    );
  }
}

export default new SkillGapController();
