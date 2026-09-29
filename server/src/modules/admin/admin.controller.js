import adminService from "./admin.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AdminController {
  async approveTeacher(req, res, next) {
    try {
      const teacher = await adminService.approveTeacher(req.params.teacherId);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Teacher approved successfully", teacher)
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteTeacher(req, res, next) {
    try {
      const teacher = await adminService.deleteTeacher(req.params.teacherId);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Teacher deleted successfully", teacher)
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteStudent(req, res, next) {
    try {
      const student = await adminService.deleteStudent(req.params.studentId);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Student deleted successfully", student)
      );
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { role, approval, search } = req.query;
      const users = await adminService.getAllUsers(role, approval, search);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Users fetched successfully", users)
      );
    } catch (err) {
      next(err);
    }
  }

  async approveUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { isApproved } = req.body;
      const user = await adminService.approveUser(userId, isApproved !== false);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "User approval status updated", user)
      );
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await adminService.updateUserRole(userId, role);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "User role updated", user)
      );
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      const user = await adminService.updateUserStatus(userId, isActive !== false);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "User status updated", user)
      );
    } catch (err) {
      next(err);
    }
  }

  async getCapacityStats(req, res, next) {
    try {
      const stats = await adminService.getCapacityStats();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Capacity stats fetched", stats)
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminController();