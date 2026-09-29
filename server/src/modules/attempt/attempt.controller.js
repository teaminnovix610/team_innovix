import attemptService from "./attempt.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AttemptController {

    async start(req, res) {

        const { attempt } = await attemptService.startAttempt(
            req.user._id,
            req.params.assessmentId
        );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Attempt started successfully", attempt)
        );

    }

    async startGuest(req, res) {

        const { attempt, guestToken } = await attemptService.startGuestAttempt(
            req.params.assessmentId,
            req.validated.body
        );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Attempt started successfully", {
                attempt,
                guestToken,
            })
        );

    }

    async saveAnswer(req, res) {

        const attempt = await attemptService.saveAnswer(
            req.params.attemptId,
            req.validated.body,
            { userId: req.user._id }
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Answer saved successfully", attempt)
        );

    }

    async saveGuestAnswer(req, res) {

        const attempt = await attemptService.saveAnswer(
            req.params.attemptId,
            req.validated.body,
            { guestToken: req.headers["x-guest-token"] }
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Answer saved successfully", attempt)
        );

    }

    async submit(req, res) {

        const attempt = await attemptService.submitAttempt(
            req.params.attemptId,
            { userId: req.user._id }
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Attempt submitted successfully", attempt)
        );

    }

    async submitGuest(req, res) {

        const attempt = await attemptService.submitAttempt(
            req.params.attemptId,
            { guestToken: req.headers["x-guest-token"] }
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Attempt submitted successfully", attempt)
        );

    }

    async analytics(req, res) {

        const data = await attemptService.getAnalytics(req.params.assessmentId);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Analytics fetched successfully", data)
        );

    }

    async leaderboard(req, res) {

        const data = await attemptService.getLeaderboard(req.params.assessmentId);

        return res.status(HttpStatus.OK).json(
            new ApiResponse(HttpStatus.OK, "Leaderboard fetched successfully", data)
        );

    }
    async getById(req, res) {

    const attempt = await attemptService.getAttempt(
        req.params.attemptId,
        { userId: req.user._id }
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Attempt fetched successfully", attempt)
    );

}

async getGuestById(req, res) {

    const attempt = await attemptService.getAttempt(
        req.params.attemptId,
        { guestToken: req.headers["x-guest-token"] }
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Attempt fetched successfully", attempt)
    );

}
async review(req, res) {

    const data = await attemptService.getReview(
        req.params.attemptId,
        { userId: req.user._id }
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Review fetched successfully", data)
    );

}

async guestReview(req, res) {

    const data = await attemptService.getReview(
        req.params.attemptId,
        { guestToken: req.headers["x-guest-token"] }
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Review fetched successfully", data)
    );

}

async lookupGuestReview(req, res) {

    const data = await attemptService.getReviewByPhone(
        req.params.assessmentId,
        req.query.phone
    );

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Review fetched successfully", data)
    );

}
async listGuestResults(req, res) {

    const data = await attemptService.getGuestResultsList(req.query.phone);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Results fetched successfully", data)
    );

}
}

export default new AttemptController();