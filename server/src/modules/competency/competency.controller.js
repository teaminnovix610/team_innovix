import competencyService from "./competency.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class CompetencyController {
  async getDomains(req, res, next) {
    try {
      const domains = await competencyService.getDomains();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Subject domains fetched", domains)
      );
    } catch (err) {
      next(err);
    }
  }

  async getFramework(req, res, next) {
    try {
      const competencies = await competencyService.getAllCompetencies();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Competency framework fetched", competencies)
      );
    } catch (err) {
      next(err);
    }
  }

  async matchTrainers(req, res, next) {
    try {
      const { domain, skill } = req.query;
      const results = await competencyService.matchTrainers(domain, skill);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Competency matching results", results)
      );
    } catch (err) {
      next(err);
    }
  }

  async matchRequirement(req, res, next) {
    try {
      const results = await competencyService.matchRequirement(req.body);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Requirement-based trainer matches", results)
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new CompetencyController();
