import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../../../config/env.js"; // adjust path to your actual env.js

const JAAS_PRIVATE_KEY = env.JAAS_PRIVATE_KEY.replace(/\\n/g, "\n");

class JitsiProvider {

    createMeeting(batchName) {
        const roomName =
            `${batchName.replace(/\s+/g, "-").toLowerCase()}-${crypto.randomBytes(4).toString("hex")}`;

        return {
            provider: "JITSI",
            roomName,
            meetingLink: `https://8x8.vc/${env.JAAS_APP_ID}/${roomName}`,
        };
    }

    generateToken({ user, roomName, isModerator }) {
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            aud: "jitsi",
            iss: "chat",
            iat: now,
            exp: now + 60 * 60 * 2,
            nbf: now - 5,
            sub: env.JAAS_APP_ID,
            room: roomName,
            context: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    moderator: isModerator,
                },
                features: {
                    recording: isModerator,
                    livestreaming: false,
                    "outbound-call": false,
                },
            },
        };

        return jwt.sign(payload, JAAS_PRIVATE_KEY, {
            algorithm: "RS256",
            keyid: env.JAAS_API_KEY_ID,
        });
    }

    async endMeeting(roomName) {
    // Jitsi/JaaS rooms close naturally as participants leave — no forced-end API used here.
    return;
}

}

export default new JitsiProvider();