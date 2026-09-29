import User from "../../models/User.model.js";
import ParentProfile from "../../models/ParentProfile.model.js";
import TeacherProfile from "../../models/TeacherProfile.model.js";

const MAX_SESSIONS = 5;

class AuthRepository {

    async findUserByEmail(email) {
        return await User.findOne({ email })
            .select("+password +refreshTokens");
    }

    async findUserByPhone(phone) {
        return await User.findOne({ phone });
    }

    async findUserById(userId) {
        return await User.findById(userId);
    }

    async findUserByIdWithRefreshTokens(userId) {
        return await User.findById(userId).select("+refreshTokens");
    }

    async createUser(userData) {
        return await User.create(userData);
    }

    async createParentProfile(userId) {
        return await ParentProfile.create({
            userId,
        });
    }

    async createTeacherProfile(userId) {
        return await TeacherProfile.create({
            userId,
        });
    }

    async addRefreshToken(userId, tokenHash, expiresAt) {
        const user = await User.findById(userId).select("+refreshTokens");

        if (!user) {
            return null;
        }

        user.refreshTokens = user.refreshTokens.filter(
            (t) => t.expiresAt > new Date()
        );

        if (user.refreshTokens.length >= MAX_SESSIONS) {
            user.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
            user.refreshTokens.shift();
        }

        user.refreshTokens.push({ tokenHash, expiresAt });

        return await user.save();
    }

    // Combines the refresh-token push + trim + lastLogin update into the
    // SAME document fetch/save that addRefreshToken already does, instead
    // of doing them as two separate round trips to Atlas (previously:
    // addRefreshToken's read+save, THEN a second updateLastLogin
    // read+write). Used by login() specifically, since that's the one
    // path that needs both together.
    async addRefreshTokenAndUpdateLastLogin(userId, tokenHash, expiresAt) {
        const user = await User.findById(userId).select("+refreshTokens");

        if (!user) {
            return null;
        }

        user.refreshTokens = user.refreshTokens.filter(
            (t) => t.expiresAt > new Date()
        );

        if (user.refreshTokens.length >= MAX_SESSIONS) {
            user.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
            user.refreshTokens.shift();
        }

        user.refreshTokens.push({ tokenHash, expiresAt });
        user.lastLogin = new Date();

        return await user.save();
    }

    async removeRefreshTokenById(userId, tokenEntryId) {
        return await User.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: { _id: tokenEntryId } },
        });
    }

    async updateLastLogin(userId) {
        return await User.findByIdAndUpdate(
            userId,
            {
                lastLogin: new Date(),
            },
            {
                new: true,
            }
        );
    }

    async deleteUserById(userId) {
        return await User.findByIdAndDelete(userId);
    }

    async findUserByEmailWithOtp(email) {
        return await User.findOne({ email })
            .select("+passwordResetOtp +passwordResetOtpExpiry");
    }

    async updateUserResetOtp(userId, hashedOtp, expiry) {
        return await User.findByIdAndUpdate(
            userId,
            {
                passwordResetOtp: hashedOtp,
                passwordResetOtpExpiry: expiry,
            },
            {
                new: true,
            }
        );
    }

    async clearUserResetOtp(userId) {
        return await User.findByIdAndUpdate(
            userId,
            {
                passwordResetOtp: null,
                passwordResetOtpExpiry: null,
            },
            {
                new: true,
            }
        );
    }

    async updateUserPassword(userId, newPassword) {
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return null;
        }

        user.password = newPassword; // pre('save') hook hashes it automatically
        return await user.save();
    }
}

export default new AuthRepository();