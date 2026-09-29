import bcrypt from "bcrypt";

class PasswordService {

    async hash(password) {
        return bcrypt.hash(password, 12);
    }

    async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }

}

export default new PasswordService();