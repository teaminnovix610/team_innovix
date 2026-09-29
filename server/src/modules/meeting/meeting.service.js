import meetingFactory from "./meeting.factory.js";

class MeetingService {

    createMeeting(provider, batchName, batchId) {
        const meetingProvider = meetingFactory.create(provider);
        return meetingProvider.createMeeting(batchName, batchId);
    }

    async generateJoinToken(provider, { user, roomName, isModerator, device }) {
        const meetingProvider = meetingFactory.create(provider);
        return await meetingProvider.generateToken({ user, roomName, isModerator, device });
    }

    async endMeeting(provider, roomName) {
        const meetingProvider = meetingFactory.create(provider);
        if (typeof meetingProvider.endMeeting === "function") {
            return await meetingProvider.endMeeting(roomName);
        }
    }

}

export default new MeetingService();