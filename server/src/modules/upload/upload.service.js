import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class UploadService {
  async uploadImage(fileBuffer, folder = "CapacityConnect/questions") {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) {
            return reject(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed"));
          }
          resolve(result);
        }
      );

      stream.end(fileBuffer);
    });
  }
}

export default new UploadService();