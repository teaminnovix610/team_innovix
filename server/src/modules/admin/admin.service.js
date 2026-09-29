import adminRepository from "./admin.repository.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class AdminService {
  async approveTeacher(teacherId) {
    const teacher = await adminRepository.approveTeacher(teacherId);
    if (!teacher) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Teacher not found");
    }
    return teacher;
  }

  async deleteTeacher(teacherId) {
    const teacher = await adminRepository.deleteTeacher(teacherId);
    if (!teacher) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Teacher not found");
    }
    return teacher;
  }

  async deleteStudent(studentId) {
    const student = await adminRepository.deleteStudent(studentId);
    if (!student) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Student not found");
    }
    return student;
  }

  async getAllUsers(role, approval, search) {
    return await adminRepository.getAllUsers(role, approval, search);
  }

  async approveUser(userId, isApproved) {
    const user = await adminRepository.approveUser(userId, isApproved);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }
    return user;
  }

  async updateUserRole(userId, role) {
    const user = await adminRepository.updateUserRole(userId, role);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }
    return user;
  }

  async updateUserStatus(userId, isActive) {
    const user = await adminRepository.updateUserStatus(userId, isActive);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }
    return user;
  }

  async getCapacityStats() {
    return await adminRepository.getCapacityStats();
  }
}

export default new AdminService();