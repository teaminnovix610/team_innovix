import User from "../../models/User.model.js";
import Student from "../../models/Student.model.js";
import Teacher from "../../models/TeacherProfile.model.js";
import Parent from "../../models/ParentProfile.model.js";
import Admin from "../../models/Admin.model.js";

class ProfileRepository {
  async getUser(userId) {
    return User.findById(userId).select("-password -refreshToken");
  }

  async updateUser(userId, data) {
    return User.findByIdAndUpdate(userId, data, {
      new: true,
    }).select("-password -refreshToken");
  }

  async getStudent(userId) {
    return Student.findOne({ userId });
  }

  async getTeacher(userId) {
    return Teacher.findOne({ userId });
  }

  async getParent(userId) {
    return Parent.findOne({ userId });
  }

  async getAdmin(userId) {
    return Admin.findOne({ userId });
  }

  async updateStudent(userId, data) {
    return Student.findOneAndUpdate({ userId }, data, {
      returnDocument: "after",
    });
  }

  async updateTeacher(userId, data) {
    return Teacher.findOneAndUpdate({ userId }, data, {
      returnDocument: "after",
    });
  }

  async updateParent(userId, data) {
    return Parent.findOneAndUpdate({ userId }, data, {
      returnDocument: "after",
    });
  }

  async updateAdmin(userId, data) {
    return Admin.findOneAndUpdate({ userId }, data, {
      returnDocument: "after",
    });
  }
}

export default new ProfileRepository();
