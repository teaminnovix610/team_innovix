import batchRepository from "./batch.repository.js";
import studentService from "../student/student.service.js";
import liveClassRepository from "../liveClass/liveClass.repository.js";

import Teacher from "../../models/TeacherProfile.model.js";
import Student from "../../models/Student.model.js";
import User from "../../models/User.model.js";
import Batch from "../../models/Batch.model.js";
import Recording from "../../models/Recording.model.js";
import Assessment from "../../models/Assessment.model.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

async function resolveTeacher(userId) {
  let teacher = await Teacher.findOne({ userId });
  if (!teacher) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    teacher = await Teacher.create({
      userId,
      isApproved: user.isApproved !== false,
      qualification: "Subject Matter Expert",
    });
  }
  return teacher;
}

async function resolveStudent(userId) {
  let student = await Student.findOne({ userId });
  if (!student) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    student = await Student.create({
      userId,
      classLevel: "Capacity Building",
      phone: user.phone || "0000000000",
      batchIds: [],
    });
  }
  return student;
}

class BatchService {
  async createBatch(userId, data) {
    const teacher = await resolveTeacher(userId);

    if (!teacher.isApproved) {
      throw new ApiError(HttpStatus.FORBIDDEN, "Your account is pending admin approval");
    }

    const batch = await batchRepository.create({
      ...data,
      teacherId: teacher._id,
    });

    return batch;
  }

  async getMyBatches(userId) {
    const teacher = await resolveTeacher(userId);
    return batchRepository.findByTeacher(teacher._id);
  }

  async getAllBatches() {
    return batchRepository.findAll();
  }

  async getCatalog(userId) {
    let studentBatchIds = [];
    if (userId) {
      const student = await Student.findOne({ userId });
      if (student && student.batchIds) {
        studentBatchIds = student.batchIds.map((id) => id.toString());
      }
    }

    const batches = await Batch.find({ isActive: true })
      .populate("teacherId", "qualification experience specialization bio userId")
      .sort({ createdAt: -1 })
      .lean();

    // Populate user info for each teacher
    const populated = await Promise.all(
      batches.map(async (batch) => {
        let trainerName = "Expert Trainer";
        let trainerOrg = "Ministry of Earth Sciences";
        if (batch.teacherId?.userId) {
          const user = await User.findById(batch.teacherId.userId).select("firstName lastName organization email").lean();
          if (user) {
            trainerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
            trainerOrg = user.organization || trainerOrg;
          }
        }

        const enrolledCount = batch.students?.length || 0;
        const isEnrolled = studentBatchIds.includes(batch._id.toString());

        // Count resources & assessments for this batch
        const resourceCount = await Recording.countDocuments({ batchId: batch._id, status: "PUBLISHED" });
        const assessmentCount = await Assessment.countDocuments({ batchId: batch._id, status: "PUBLISHED" });

        return {
          ...batch,
          trainerName,
          trainerOrg,
          enrolledCount,
          isEnrolled,
          resourceCount,
          assessmentCount,
          capacity: batch.capacity || 100,
          category: batch.category || "Earth Sciences",
          durationHours: batch.durationHours || 30,
          description: batch.description || "Comprehensive capacity building module.",
          syllabus: batch.syllabus?.length ? batch.syllabus : [
            "Module 1: Fundamental Concepts & Framework",
            "Module 2: Practical Data & Sensor Analysis",
            "Module 3: Advanced Modeling & Simulation",
            "Module 4: Case Studies & Final Assessment",
          ],
        };
      })
    );

    return populated;
  }

  async enroll(userId, batchId) {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Course / Program not found");
    }

    if (!batch.isActive) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Course is currently inactive");
    }

    const student = await resolveStudent(userId);

    const alreadyEnrolled = (student.batchIds || []).some(
      (id) => id.toString() === batchId.toString()
    );

    if (alreadyEnrolled) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "You are already enrolled in this course");
    }

    // Add to batch and student
    await Batch.findByIdAndUpdate(batchId, {
      $addToSet: { students: student._id },
    });

    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { batchIds: batch._id },
    });

    return {
      enrolled: true,
      batchId: batch._id,
      name: batch.name,
    };
  }

  async getMyEnrollments(userId) {
    const student = await resolveStudent(userId);

    const batches = await Batch.find({
      _id: { $in: student.batchIds || [] },
    })
      .populate("teacherId")
      .lean();

    const withProgress = await Promise.all(
      batches.map(async (b) => {
        const resourceCount = await Recording.countDocuments({ batchId: b._id, status: "PUBLISHED" });
        const assessmentCount = await Assessment.countDocuments({ batchId: b._id, status: "PUBLISHED" });

        // Estimated progress calculation
        const progress = Math.min(100, Math.max(15, 20 + (resourceCount * 15)));

        let trainerName = "MoES Lead Trainer";
        if (b.teacherId?.userId) {
          const user = await User.findById(b.teacherId.userId).select("firstName lastName organization").lean();
          if (user) trainerName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        }

        return {
          ...b,
          progress,
          trainerName,
          resourceCount,
          assessmentCount,
        };
      })
    );

    return withProgress;
  }

  async getBatchById(userId, userRole, batchId) {
    const batch = await batchRepository.findById(batchId);

    if (!batch) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
    }

    const students = await studentService.getAllByBatch(batchId);
    const batchObj = batch.toObject();
    batchObj.students = students;

    return batchObj;
  }

  async getBatchStudents(userId, userRole, batchId) {
    return studentService.getAllByBatch(batchId);
  }

  async assignStudentToBatch(batchId, studentId) {
    const batch = await batchRepository.findById(batchId);

    if (!batch) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
    }

    const student = await Student.findById(studentId);

    if (!student) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Student not found");
    }

    const alreadyInBatch = student.batchIds.some(
      (id) => id.toString() === batchId.toString()
    );

    if (alreadyInBatch) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Student already assigned to this batch"
      );
    }

    return batchRepository.assignStudent(batchId, studentId);
  }

  async getStudentBatches(userId) {
    const student = await Student.findOne({ userId }).populate("batchIds");
    if (!student) {
      return [];
    }
    return student.batchIds || [];
  }

  async deleteBatch(userId, userRole, batchId) {
    const batch = await batchRepository.findById(batchId);

    if (!batch) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Batch not found");
    }

    await Student.updateMany(
      { batchIds: batchId },
      { $pull: { batchIds: batchId } }
    );

    await liveClassRepository.deleteByBatch(batchId);
    await batchRepository.delete(batchId);

    return true;
  }
}

export default new BatchService();