import ApiError from "../errors/ApiError.js";
import HttpStatus from "../constants/HttpStatus.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const isAllowed = roles.some((r) => {
      if (r === userRole) return true;
      if (r === "STUDENT" && (userRole === "TRAINEE" || userRole === "STUDENT")) return true;
      if (r === "TRAINEE" && (userRole === "TRAINEE" || userRole === "STUDENT")) return true;
      if (r === "TEACHER" && (userRole === "TRAINER" || userRole === "TEACHER")) return true;
      if (r === "TRAINER" && (userRole === "TRAINER" || userRole === "TEACHER")) return true;
      if (r === "ADMIN" && userRole === "ADMIN") return true;
      return false;
    });

    if (!isAllowed) {
      return next(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Access denied"
        )
      );
    }

    next();
  };
};

export default authorize;