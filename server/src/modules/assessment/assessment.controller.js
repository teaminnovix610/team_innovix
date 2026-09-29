import assessmentService from "./assessment.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AssessmentController {

    async create(req, res) {

        const assessment = await assessmentService.createAssessment(
            req.user._id,
            req.validated.body
        );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Assessment created successfully", assessment)
        );

    }

    async addQuestion(req, res) {

        const question = await assessmentService.addQuestion(
            req.user._id,
            req.params.assessmentId,
            req.validated.body
        );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Question added successfully", question)
        );

    }

    async publish(req, res) {

        const assessment = await assessmentService.publishAssessment(
            req.user._id,
            req.params.assessmentId
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Assessment published successfully", assessment)
        );

    }

    async listForBatch(req, res) {

        const assessments = await assessmentService.getForBatch(
            req.params.batchId,
            req.user.role
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Assessments fetched successfully", assessments)
        );

    }

    async getById(req, res) {

        const data = await assessmentService.getDetail(
            req.params.assessmentId,
            req.user.role
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Assessment fetched successfully", data)
        );

    }

    async getPublicWeeklyTest(req, res) {

        const data = await assessmentService.getPublicWeeklyTest();

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Weekly test fetched successfully", data)
        );

    }

    async listMine(req, res) {

        const assessments = await assessmentService.getMyAssessments(req.user._id);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Assessments fetched successfully", assessments)
        );

    }

    async listForStudent(req, res) {

        const assessments = await assessmentService.getForStudent(req.user._id);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Assessments fetched successfully", assessments)
        );

    }
    async getPublicById(req, res) {

    const data = await assessmentService.getPublicDetail(req.params.assessmentId);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Assessment fetched successfully", data)
    );

}
async listPublicWeeklyTests(req, res) {

    const data = await assessmentService.getPublicWeeklyTests(req.query.classLevel);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Weekly tests fetched successfully", data)
    );

}
async updateQuestion(req, res) {

    const question = await assessmentService.updateQuestion(
        req.user._id,
        req.params.assessmentId,
        req.params.questionId,
        req.validated.body
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Question updated successfully", question)
    );

}

async deleteQuestion(req, res) {

    await assessmentService.deleteQuestion(
        req.user._id,
        req.params.assessmentId,
        req.params.questionId
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Question deleted successfully", null)
    );

}

}

export default new AssessmentController();