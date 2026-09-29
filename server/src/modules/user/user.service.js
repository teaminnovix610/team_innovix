import userRepository from "./user.repository.js";

import ApiError from "../../shared/errors/ApiError.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class UserService {

    async getAllUsers(query) {

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const filters = {

        page,

        limit,

        role: query.role,

        search: query.search,

        isActive:
            query.isActive === undefined
                ? undefined
                : query.isActive === "true",

    };

    const result =
        await userRepository.findAll(filters);

    return {

        users: result.users,

        pagination: {

            page,

            limit,

            total: result.total,

            totalPages: Math.ceil(
                result.total / limit
            ),

        },

    };

}

    async getUser(id) {

        const user =
            await userRepository.findById(id);

        if (!user) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "User not found"
            );
        }

        return user;

    }

    async updateUser(id, data) {

        const user =
            await userRepository.update(id, data);

        if (!user) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "User not found"
            );
        }

        return user;

    }

    async deleteUser(id) {

        const user =
            await userRepository.delete(id);

        if (!user) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "User not found"
            );
        }

    }

}

export default new UserService();