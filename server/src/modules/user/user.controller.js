import userService from "./user.service.js";

import ApiResponse from "../../shared/responses/ApiResponse.js";
import HttpStatus from "../../shared/constants/HttpStatus.js";

class UserController {

    async getAll(req, res) {

        const users =
    await userService.getAllUsers(
        req.query
    );

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "Users fetched successfully",

                users

            )

        );

    }

    async getOne(req, res) {

        const user =
            await userService.getUser(
                req.params.id
            );

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "User fetched successfully",

                user

            )

        );

    }

    async update(req, res) {

        const user =
            await userService.updateUser(
                req.params.id,
                req.validated.body
            );

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "User updated successfully",

                user

            )

        );

    }

    async delete(req, res) {

        await userService.deleteUser(
            req.params.id
        );

        return res.status(HttpStatus.OK).json(

            new ApiResponse(

                HttpStatus.OK,

                "User deleted successfully"

            )

        );

    }

}

export default new UserController();