import User from "../../models/User.model.js";

class UserRepository {

    async findAll(filters) {

        const {
            page,
            limit,
            role,
            search,
            isActive,
        } = filters;

        const query = {};

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        if (search) {
            query.$or = [
                {
                    firstName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    lastName: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select("-password -refreshToken")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({
                createdAt: -1,
            });

        return {
            users,
            total,
        };
    }

    async findById(id) {
        return User.findById(id)
            .select("-password -refreshToken");
    }

    async update(id, data) {
        return User.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
            }
        ).select("-password -refreshToken");
    }

    async delete(id) {
        return User.findByIdAndDelete(id);
    }

}

export default new UserRepository();