import certificateRepository from "./certificate.repository.js";
import User from "../../models/User.model.js";
import Batch from "../../models/Batch.model.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class CertificateService {
  async getMyCertificates(userId) {
    let certs = await certificateRepository.findByTrainee(userId);
    if (!certs || certs.length === 0) {
      // If user has not yet earned certificates, return sample starter credentials if they have certificates in User model
      const user = await User.findById(userId);
      if (user?.certificates?.length) {
        certs = user.certificates.map((c, idx) => ({
          _id: `user-cert-${idx}`,
          traineeId: user._id,
          traineeName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          traineeEmail: user.email,
          courseName: c.title,
          certificateNumber: c.credentialId || `MOES-CERT-${Date.now()}-${idx + 1}`,
          issueDate: c.issueDate ? new Date(c.issueDate) : new Date(),
          grade: "A+",
          score: 92,
          issuedBy: c.issuer || "Ministry of Earth Sciences (MoES)",
          status: "ISSUED",
        }));
      }
    }
    return certs;
  }

  async getAllCertificates() {
    return certificateRepository.findAll();
  }

  async getCertificateById(id) {
    const cert = await certificateRepository.findById(id);
    if (!cert) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Certificate not found");
    }
    return cert;
  }

  async verifyCertificate(certificateNumber) {
    const cert = await certificateRepository.findByNumber(certificateNumber);
    if (!cert) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Invalid Certificate Number");
    }
    return cert;
  }

  async issueCertificate({ traineeId, courseId, courseName, grade, score }) {
    const trainee = await User.findById(traineeId);
    if (!trainee) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Trainee not found");
    }

    let finalCourseName = courseName;
    if (courseId && !finalCourseName) {
      const batch = await Batch.findById(courseId);
      if (batch) finalCourseName = batch.name;
    }

    const certificateNumber = `MOES-CC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cert = await certificateRepository.create({
      traineeId,
      traineeName: trainee.fullName || `${trainee.firstName || ''} ${trainee.lastName || ''}`.trim(),
      traineeEmail: trainee.email,
      courseId: courseId || null,
      courseName: finalCourseName || "Earth Sciences Capacity Building Program",
      certificateNumber,
      grade: grade || "A",
      score: score || 88,
      issuedBy: "Ministry of Earth Sciences (MoES)",
      status: "ISSUED",
    });

    // Also append to trainee's certificates array in User document
    await User.findByIdAndUpdate(traineeId, {
      $push: {
        certificates: {
          title: cert.courseName,
          issuer: cert.issuedBy,
          issueDate: new Date().toISOString().split("T")[0],
          credentialId: cert.certificateNumber,
        },
      },
    });

    return cert;
  }

  async getStats() {
    return certificateRepository.getStats();
  }
}

export default new CertificateService();
