import profileRepository from "./profile.repository.js";

class ProfileService {

    async getProfile(userId) {

        const user =
            await profileRepository.getUser(userId);

        let profile = null;

        switch (user.role) {
            case "TRAINEE":
            case "STUDENT":
                profile = await profileRepository.getStudent(userId);
                break;

            case "TRAINER":
            case "TEACHER":
                profile = await profileRepository.getTeacher(userId);
                break;

            case "PARENT":
                profile = await profileRepository.getParent(userId);
                break;

            case "ADMIN":
                profile = await profileRepository.getAdmin(userId);
                break;
        }

        return {
            user,
            profile,
        };

    }

    async updateProfile(userId, data) {
        const {
            firstName,
            lastName,
            phone,
            organization,
            bio,
            qualifications,
            workExperience,
            interests,
            skills,
            subjects,
            competencies,
            certificates,
            ...profileData
        } = data;

        const updatedUser = await profileRepository.updateUser(
            userId,
            {
                firstName,
                lastName,
                phone,
                organization,
                bio,
                qualifications,
                workExperience,
                interests,
                skills,
                subjects,
                competencies,
                certificates,
            }
        );

        const user = updatedUser || await profileRepository.getUser(userId);

        let profile;

        switch (user.role) {
            case "TRAINEE":
            case "STUDENT":
                profile = await profileRepository.updateStudent(userId, profileData);
                break;

            case "TRAINER":
            case "TEACHER":
                profile = await profileRepository.updateTeacher(userId, profileData);
                break;

            case "PARENT":
                profile = await profileRepository.updateParent(userId, profileData);
                break;

            case "ADMIN":
                profile = await profileRepository.updateAdmin(userId, profileData);
                break;
        }

        return {
            user,
            profile,
        };

    }

}

export default new ProfileService();