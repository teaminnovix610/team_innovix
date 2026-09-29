import jwt from "jsonwebtoken";

import env from "../../config/env.js";

import ApiError from "../errors/ApiError.js";
import HttpStatus from "../constants/HttpStatus.js";

import User from "../../models/User.model.js";

const authenticate = async (req, res, next) => {
    try {

        const token = req.cookies.accessToken;

        if (!token) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "Access token is missing"
            );
        }

        const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new ApiError(
                HttpStatus.UNAUTHORIZED,
                "User not found"
            );
        }

        if (!user.isActive) {
            throw new ApiError(
                HttpStatus.FORBIDDEN,
                "Account is disabled"
            );
        }

        req.user = user;

        next();

    } catch (error) {
        next(error);
    }
};

export default authenticate;