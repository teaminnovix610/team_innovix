import batchService from "./batch.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class BatchController {

    async create(req, res) {

        const batch = await batchService.createBatch(
            req.user._id,
            req.validated.body
        );

        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(
                HttpStatus.CREATED,
                "Batch created successfully",
                batch
            )
        );

    }

    async assignCourseToTrainer(req, res) {
        const batch = await batchService.assignCourseToTrainer(req.validated.body);
        return res.status(HttpStatus.CREATED).json(
            new ApiResponse(HttpStatus.CREATED, "Course assigned to trainer successfully", batch)
        );
    }

    async myBatches(req, res) {

        const batches =
            await batchService.getMyBatches(
                req.user._id
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Batches fetched successfully",
                batches
            )
        );

    }

    async getAll(req, res) {

        const batches =
            await batchService.getAllBatches();

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Batches fetched successfully",
                batches
            )
        );

    }

    async assignStudent(req, res) {

        const batch =
            await batchService.assignStudentToBatch(
                req.params.batchId,
                req.validated.body.studentId
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Student assigned successfully",
                batch
            )
        );

    }

    async getBatchById(req, res) {

        const batch =
            await batchService.getBatchById(
                req.user._id,
                req.user.role,
                req.params.batchId
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Batch fetched successfully",
                batch
            )
        );

    }

    async getBatchStudents(req, res) {

        const students =
            await batchService.getBatchStudents(
                req.user._id,
                req.user.role,
                req.params.batchId
            );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Students fetched successfully",
                students
            )
        );

    }
    async getStudentBatches(req, res) {

    const batches =
        await batchService.getStudentBatches(req.user._id);

    return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Batches fetched successfully", batches)
    );

}

    async deleteBatch(req, res) {

        await batchService.deleteBatch(
            req.user._id,
            req.user.role,
            req.params.batchId
        );

        return res.status(HttpStatus.OK).json(
            new ApiResponse(
                HttpStatus.OK,
                "Batch deleted successfully",
                null
            )
        );

    }

    async getCatalog(req, res, next) {
        try {
            const catalog = await batchService.getCatalog(req.user?._id);
            return res.status(HttpStatus.OK).json(
                new ApiResponse(HttpStatus.OK, "Course catalog fetched successfully", catalog)
            );
        } catch (err) {
            next(err);
        }
    }

    async enroll(req, res, next) {
        try {
            const result = await batchService.enroll(req.user._id, req.params.batchId);
            return res.status(HttpStatus.OK).json(
                new ApiResponse(HttpStatus.OK, "Enrolled in course successfully", result)
            );
        } catch (err) {
            next(err);
        }
    }

    async getMyEnrollments(req, res, next) {
        try {
            const enrollments = await batchService.getMyEnrollments(req.user._id);
            return res.status(HttpStatus.OK).json(
                new ApiResponse(HttpStatus.OK, "My enrolled courses fetched successfully", enrollments)
            );
        } catch (err) {
            next(err);
        }
    }

}

export default new BatchController();
