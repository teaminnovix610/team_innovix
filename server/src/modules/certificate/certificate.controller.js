import certificateService from "./certificate.service.js";
import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class CertificateController {
  async getMyCertificates(req, res, next) {
    try {
      const certs = await certificateService.getMyCertificates(req.user._id);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Certificates fetched successfully", certs)
      );
    } catch (err) {
      next(err);
    }
  }

  async getAllCertificates(req, res, next) {
    try {
      const certs = await certificateService.getAllCertificates();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "All certificates fetched", certs)
      );
    } catch (err) {
      next(err);
    }
  }

  async getCertificateById(req, res, next) {
    try {
      const cert = await certificateService.getCertificateById(req.params.id);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Certificate details", cert)
      );
    } catch (err) {
      next(err);
    }
  }

  async verifyCertificate(req, res, next) {
    try {
      const cert = await certificateService.verifyCertificate(req.params.certificateNumber);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Certificate verified", cert)
      );
    } catch (err) {
      next(err);
    }
  }

  async issueCertificate(req, res, next) {
    try {
      const cert = await certificateService.issueCertificate(req.body);
      return res.status(HttpStatus.CREATED).json(
        new ApiResponse(HttpStatus.CREATED, "Certificate issued successfully", cert)
      );
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await certificateService.getStats();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(HttpStatus.OK, "Certificate stats fetched", stats)
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new CertificateController();
