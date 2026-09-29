import crypto from "crypto";
import { AccessToken, RoomServiceClient, DataPacket_Kind } from "livekit-server-sdk";
import env from "../../../config/env.js";

const toHttpUrl = (url) =>
    url.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");

const roomService = new RoomServiceClient(
    toHttpUrl(env.LIVEKIT_URL),
    env.LIVEKIT_API_KEY,
    env.LIVEKIT_API_SECRET
);

class LiveKitProvider {

    createMeeting(batchName) {
        const roomName =
            `${batchName.replace(/\s+/g, "-").toLowerCase()}-${crypto.randomBytes(4).toString("hex")}`;

        return {
            provider: "LIVEKIT",
            roomName,
            meetingLink: null,
        };
    }

    async generateToken({ user, roomName, isModerator, device = "main" }) {
        const identity = isModerator
            ? `teacher-${user._id.toString()}-${device}`
            : `student-${user._id.toString()}`;

        const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
            identity,
            name: user.name,
            ttl: "2h",
            metadata: JSON.stringify({
                userId: user._id.toString(),
                role: isModerator ? "teacher" : "student",
                ...(isModerator ? { device } : {}),
            }),
        });

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            roomRecord: isModerator,
        });

        return await at.toJwt();
    }

    // Broadcasts a "class-ended" message, gives clients a moment to display it,
    // then force-disconnects everyone by deleting the room.
    async endMeeting(roomName) {
        try {
            await roomService.sendData(
                roomName,
                new TextEncoder().encode(JSON.stringify({ type: "class-ended" })),
                DataPacket_Kind.RELIABLE
            );
        } catch {
            // room may already be empty — not fatal
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));

        try {
            await roomService.deleteRoom(roomName);
        } catch {
            // room may not exist (nobody ever joined) — not fatal
        }
    }

}

export default new LiveKitProvider();