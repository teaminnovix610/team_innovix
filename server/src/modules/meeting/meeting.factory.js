import jitsiProvider from "./providers/jitsi.provider.js";
import livekitProvider from "./providers/livekit.provider.js";

class MeetingFactory {

    create(provider = "JITSI") {

        switch (provider) {

            case "JITSI":
                return jitsiProvider;

            case "LIVEKIT":
                return livekitProvider;

            default:
                throw new Error("Meeting provider not supported");
        }

    }

}

export default new MeetingFactory();