import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  LiveKitRoom,
  useRoomContext,
  useTracks,
  useParticipants,
  useLocalParticipant,
  VideoTrack,
  RoomAudioRenderer,
  ControlBar,
  LayoutContextProvider,
  useCreateLayoutContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  RoomEvent,
  ParticipantEvent,
  Track,
  DataPacket_Kind,
  VideoPresets,
  VideoQuality,
  ConnectionQuality,
} from "livekit-client";
import { useNavigate } from "react-router-dom";
import {
  Expand,
  Hand,
  LogOut,
  Mic,
  MicOff,
  PenLine,
  Settings,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { endLiveClass } from "../services/liveClass.service";

// Whiteboard feature — see features/whiteboard/ for the editor wrapper,
// its own LiveKit data-channel sync hooWhiteboardPanelk (separate "whiteboard" topic,
// independent of the "moderation" topic used everywhere else in this
// file), persistence, and initial-load hydration. This file only owns
// WHETHER the whiteboard is currently open for the class (broadcast via
// ModerationProvider, same as pinned/micLocked) and where it renders.
// Adjust this import path to match where the feature folder actually
// lives in the repo.
import WhiteboardErrorBoundary from "../components/WhiteboardErrorBoundary";
import WhiteboardCanvas from "../../whiteboard/components/WhiteboardCanvas";

/* ============================================================
   Data-channel helpers
   ============================================================ */

function encode(msg) {
  return new TextEncoder().encode(JSON.stringify(msg));
}

async function safePublish(room, msg, destinationIdentities, attempt = 0) {
  const payload = encode(msg);
  const options = {
    reliable: true,
    topic: "moderation",
    ...(destinationIdentities ? { destinationIdentities } : {}),
  };
  try {
    await room.localParticipant.publishData(payload, options);
  } catch (err) {
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return safePublish(room, msg, destinationIdentities, attempt + 1);
    }
    // Fallback: try without topic
    try {
      await room.localParticipant.publishData(
        payload,
        DataPacket_Kind.RELIABLE
      );
    } catch (err2) {
      // Log only once at final failure, avoid spam
      console.error("[LiveClass] publishData failed after retries", err2);
    }
  }
}

/* ============================================================
   Device role detection
   ============================================================ */

// Identity format: "<role>-<device>[-<suffix>]", e.g. "teacher-main",
// "teacher-board", or "teacher-board-3f9a" if a session suffix is ever
// appended. This checks split segments instead of using
// identity.endsWith("-board") / endsWith("-main"), because a plain
// endsWith check silently (no error, no log) falls through to "not a
// board device" the moment the identity doesn't end EXACTLY in
// "-board" — e.g. a trailing session suffix, a typo'd casing, or any
// future change to how identities get generated on the backend. That
// silent fallthrough is what caused the board camera to be tuned with
// MAIN_ADAPTIVE_TIERS instead of BOARD_ADAPTIVE_TIERS despite looking
// like a board device. Splitting on "-" and checking segments keeps
// working even if a suffix gets appended, and logs once per identity so
// a mismatch is visible immediately instead of needing to be inferred
// from an absent log line.
const loggedIdentities = new Set();

function getDeviceRole(identity) {
  const parts = identity.split("-");
  const role = parts.includes("board")
    ? "board"
    : parts.includes("main")
    ? "main"
    : "unknown";

  if (!loggedIdentities.has(identity)) {
    loggedIdentities.add(identity);
    if (role === "unknown") {
      console.warn(
        `[LiveClass] getDeviceRole: identity "${identity}" doesn't match expected "<role>-main" / "<role>-board" pattern — defaulting to main-cam tuning. Check how this identity is generated.`
      );
    }
    else {
      console.log(`[LiveClass] getDeviceRole: "${identity}" -> ${role}`);
    }
  }

  return role;
}

// `localParticipant.identity` is a plain object property, not React
// state — it starts as "" and only becomes the real assigned identity
// once the server completes the join handshake. Effects that read it
// directly at mount (via a dependency array that only includes the
// localParticipant OBJECT, whose reference doesn't change when just its
// .identity property is set later) can permanently see "" and never get
// a second chance to re-evaluate, even after the real identity is known.
// This hook wraps identity in actual React state, refreshed on
// RoomEvent.Connected (which only ever fires once the server has fully
// established the session — identity is guaranteed correct by then), so
// anything depending on the STRING this returns correctly re-runs the
// moment it changes from "" to the real value.
function useStableLocalIdentity() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [identity, setIdentity] = useState(localParticipant.identity || "");

  useEffect(() => {
    const syncIdentity = () =>
      setIdentity(room.localParticipant.identity || "");
    syncIdentity(); // covers the case where we're already connected by the time this runs
    room.on(RoomEvent.Connected, syncIdentity);
    return () => room.off(RoomEvent.Connected, syncIdentity);
  }, [room]);

  return identity;
}

/* ============================================================
   Quality helpers
   ============================================================ */

// Forces a given track's SUBSCRIBER-side quality request to a fixed
// value and keeps re-asserting it on an interval. This exists because
// LiveKit's adaptiveStream heuristic (sizing quality to the track's
// actual rendered dimensions) will otherwise fight a one-time
// setVideoQuality call and quietly revert it — the interval re-applies
// our choice so it sticks.
//
// Used two ways in this file:
//  - `useForceQuality(bigTrack)` — whatever's currently the big/pinned
//    view gets HIGH, since that's what's actually filling the screen.
//  - `useForceQuality(boardCam, VideoQuality.HIGH)` — the teacher's
//    board camera gets pinned to HIGH permanently and unconditionally,
//    regardless of what's currently on screen or what the viewer's own
//    connection quality is doing. See useMainCamAdaptiveQuality below
//    for the other half of that trade.
function useForceQuality(
  trackRef,
  quality = VideoQuality.HIGH,
  intervalMs = 5000
) {
  useEffect(() => {
    if (!trackRef) return;
    const apply = () => {
      const pub = trackRef?.publication;
      if (pub && typeof pub.setVideoQuality === "function") {
        pub.setVideoQuality(quality);
      }
    };
    apply();
    const interval = setInterval(apply, intervalMs);
    return () => clearInterval(interval);
  }, [trackRef, quality, intervalMs]);
}

// The board camera is pinned at permanent HIGH via useForceQuality above,
// no matter what — that stream is never allowed to compromise. This hook
// is the other half of that trade: it watches THIS student's own
// downlink (their local participant's ConnectionQualityChanged events,
// which reflect their personal connection, not the teacher's) and pulls
// the main/talking-head camera's subscriber-side quality DOWN when their
// connection degrades. Main cam is the only lever available on the
// subscriber side to make room for board — we can't change the
// teacher's encoder settings from here, only which simulcast layer we
// ask to receive for a track we don't otherwise care about protecting.
//
// Poor/Lost -> LOW (free up as much of this student's bandwidth as
// possible for board). Good -> MEDIUM (some headroom exists, but don't
// get greedy). Excellent (or unknown, as a safe default) -> HIGH, since
// at that point there's enough bandwidth for both streams anyway.
function useMainCamAdaptiveQuality(trackRef) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const lastQualityRef = useRef(null);

  useEffect(() => {
    if (!trackRef) return;

    const applyForQuality = (quality) => {
      const pub = trackRef.publication;
      if (!pub || typeof pub.setVideoQuality !== "function") return;
      if (
        quality === ConnectionQuality.Poor ||
        quality === ConnectionQuality.Lost
      ) {
        pub.setVideoQuality(VideoQuality.LOW);
      }
      else if (quality === ConnectionQuality.Good) {
        pub.setVideoQuality(VideoQuality.MEDIUM);
      }
      else {
        pub.setVideoQuality(VideoQuality.HIGH);
      }
    };

    // Apply immediately using whatever quality we last observed (or a
    // safe "Good" default on first mount) instead of waiting for the
    // next ConnectionQualityChanged event, which might not fire again
    // for a while if the connection is already stable.
    applyForQuality(lastQualityRef.current ?? ConnectionQuality.Good);

    const handleQualityChanged = (quality, participant) => {
      // Only react to OUR OWN connection quality — not the teacher's,
      // not another student's.
      if (participant.identity !== localParticipant.identity) return;
      if (quality === lastQualityRef.current) return;
      lastQualityRef.current = quality;
      applyForQuality(quality);
    };

    room.on(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
    return () =>
      room.off(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
  }, [room, localParticipant, trackRef]);
}

// Tracks LiveKit's own reconnect lifecycle (RoomEvent.Reconnecting /
// Reconnected) so the UI can show a clear "Reconnecting..." overlay
// instead of leaving the last frame frozen on screen with no
// explanation.
function useConnectionStatus() {
  const room = useRoomContext();
  const [status, setStatus] = useState("connected"); // "connected" | "reconnecting"

  useEffect(() => {
    if (!room) return;

    const onReconnecting = () => {
      console.warn("[LiveClass] connection lost, attempting to reconnect...");
      setStatus("reconnecting");
    };
    const onReconnected = () => {
      console.log("[LiveClass] reconnected");
      setStatus("connected");
    };

    room.on(RoomEvent.Reconnecting, onReconnecting);
    room.on(RoomEvent.Reconnected, onReconnected);
    return () => {
      room.off(RoomEvent.Reconnecting, onReconnecting);
      room.off(RoomEvent.Reconnected, onReconnected);
    };
  }, [room]);

  return status;
}

// ------------------------------------------------------------------
// Forced-rejoin fallback for the "student manually leaves+rejoins
// faster than LiveKit's own reconnect" gap discussed above.
//
// LiveKit's own Reconnecting -> Reconnected flow is left to run first
// (see FAST_RECONNECT_POLICY below, which also tightens its own early
// retry timing) because genuine short blips resolve fastest that way
// and it's lower-risk than tearing the session down ourselves. But for
// the specific case this was raised about — a network SWITCH (wifi <->
// cellular, or a new IP outright) — LiveKit's "resume" step can spend
// several retries patching a session over a network path that's simply
// gone before it gives up and falls back to a full reconnect. Waiting
// that out is exactly what's slower than a manual leave/rejoin.
//
// This hook is the automatic version of that manual leave/rejoin: if
// we're still stuck in "Reconnecting" after FORCE_REJOIN_TIMEOUT_MS, we
// stop waiting on LiveKit's own attempt and force a fresh session
// ourselves — same end effect as clicking Leave then Join, but
// immediate and without a page navigation round-trip.
//
// Things this depends on / provides elsewhere in the file:
//  1. `suppressLeaveNavRef` — the root component's onDisconnected
//     handler (handleLeave) navigates the user out of the class
//     whenever the underlying Room disconnects. Our OWN internal
//     room.disconnect() call below would otherwise trigger that and
//     boot the student out of the class entirely, which is the
//     opposite of the goal. We flip this ref on right before our
//     internal disconnect and back off once the fresh connect settles,
//     so handleLeave can tell "user actually left" apart from "we're
//     mid-forced-rejoin" and skip navigating away for the latter.
//  2. Re-emitting RoomEvent.Reconnected ourselves once the fresh
//     connect() resolves — every recovery hook in this file
//     (useMediaStateRecovery, useManagedSubscriptions,
//     useTeacherSubscriptionThrottle, useAdaptiveQuality, and
//     ModerationProvider's own sync-state rebroadcast/request) already
//     listens for that event and re-applies its own state. Because
//     this all happens on the SAME Room instance (no React remount),
//     none of those hooks' refs are lost either — this is simply
//     forcing them to re-run their existing "just reconnected" logic
//     against a session that's now actually fresh.
//  3. `cancelRef` — a ref (owned by the root component) that this hook
//     fills in with a `cancel(reason)` function. This exists so a
//     MANUAL Leave / Leave-and-Reconnect click can stop this loop
//     outright instead of racing it. Without this, if the student
//     clicks Leave while a retry is sitting in its backoff window,
//     `suppressLeaveNavRef.current` is still true, so their manual
//     room.disconnect() gets silently swallowed by handleLeave — the
//     click appears to do nothing, and the queued retry then
//     reconnects them right back in a moment later, against their
//     wishes. BottomBar's Leave/Reconnect handlers call
//     `forcedRejoinCancelRef.current?.()` BEFORE calling
//     room.disconnect(), so navigation is never blocked by an
//     in-progress auto-recovery. See cancelLoop below for how this
//     also handles the harder case where an attempt is already
//     in-flight (mid disconnect()+connect()) at the moment of the
//     cancel.
//
// Worth knowing: from every OTHER participant's point of view (the
// teacher, other students), a successful forced rejoin is functionally
// indistinguishable from a real leave+rejoin — they'll see
// ParticipantDisconnected then ParticipantConnected for this student,
// and this student goes through the same late-joiner path (fresh
// sync-state push, fresh subscription rules) rather than any
// reconnect-specific code path. That was already called out as an
// acceptable tradeoff, and it means this piggybacks on logic that's
// already exercised by every normal join.
//
// IMPORTANT — this is a RETRY LOOP, not a single attempt. An earlier
// version of this hook tried the forced rejoin exactly once and, if
// THAT attempt also failed (e.g. the network was still genuinely down
// at that exact moment — a real ERR_NAME_NOT_RESOLVED, not just a
// blip), gave up and let the room's Disconnected event fall through to
// the normal onDisconnected -> navigate(-1) handler. That silently
// booted the student back to the previous screen while their wifi was
// still off — worse than doing nothing, since now they have to notice
// they got kicked out and manually find their way back into the class.
// A single-shot attempt defeats the whole point of this hook the
// moment connectivity hasn't fully returned yet.
//
// Instead: once the loop starts, it keeps suppressing navigation and
// keeps retrying (with backoff, capped at FORCE_REJOIN_MAX_RETRY_DELAY_MS)
// until either a rejoin succeeds, it's cancelled (manual leave), or
// FORCE_REJOIN_MAX_ELAPSED_MS of continuous failure has passed — only
// then does it give up and let the normal disconnected/leave flow take
// over, on the theory that at that point something other than "wifi
// still coming back" is probably wrong and the student is better served
// by a clear "you've been disconnected" screen than an infinite silent
// spinner.
//
// It also listens for the browser's `online` event to retry
// immediately the moment connectivity is reported back, rather than
// sitting out whatever backoff delay happens to be queued — this is
// exactly the "turned wifi off, then back on" case from testing, where
// otherwise the fix would just be waiting on a timer that has no idea
// wifi came back.
const FORCE_REJOIN_TIMEOUT_MS = 5500;
const FORCE_REJOIN_RETRY_DELAYS_MS = [1000, 2000, 4000, 6000];
const FORCE_REJOIN_MAX_RETRY_DELAY_MS = 8000;
const FORCE_REJOIN_MAX_ELAPSED_MS = 90_000;

function useForcedRejoinFallback(wsUrl, token, suppressLeaveNavRef, cancelRef) {
  const room = useRoomContext();
  const stuckTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const inFlightRef = useRef(false); // true only while an actual disconnect()+connect() call is in flight
  const loopActiveRef = useRef(false); // true for the whole retry loop, across multiple attempts
  const attemptRef = useRef(0);
  const loopStartedAtRef = useRef(null);
  // Set by a manual Leave / Leave-and-Reconnect click via cancelRef.
  // Checked at every decision point inside the loop so a cancel always
  // wins, whether it lands during a backoff wait or while an attempt is
  // actually in flight.
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!room || !wsUrl || !token) return;

    const clearStuckTimer = () => {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    };
    const clearRetryTimer = () => {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    };

    const endLoop = (reason) => {
      clearStuckTimer();
      clearRetryTimer();
      inFlightRef.current = false;
      loopActiveRef.current = false;
      attemptRef.current = 0;
      loopStartedAtRef.current = null;
      if (suppressLeaveNavRef) suppressLeaveNavRef.current = false;
      if (reason)
        console.log(`[LiveClass] forced-rejoin loop ended: ${reason}`);
    };

    // Called from outside (BottomBar's doLeave/doReconnect) BEFORE the
    // manual room.disconnect(). Two cases:
    //  - No attempt currently in flight (we're just sitting in a
    //    backoff wait, or the loop isn't running at all): safe to tear
    //    everything down and clear suppressLeaveNavRef immediately, so
    //    the upcoming manual disconnect() is free to navigate the
    //    student out normally.
    //  - An attempt IS in flight (its disconnect()+connect() call is
    //    already running): we can't abort that network call, so we
    //    mark cancelledRef and let attemptRejoin's own check (right
    //    after it resolves) notice the cancellation and disconnect
    //    again immediately, rather than racing a second manual
    //    disconnect() against livekit-client's in-progress connect().
    const cancelLoop = (reason) => {
      if (!loopActiveRef.current && !inFlightRef.current) {
        if (suppressLeaveNavRef) suppressLeaveNavRef.current = false;
        return;
      }
      cancelledRef.current = true;
      clearStuckTimer();
      clearRetryTimer();
      if (!inFlightRef.current) {
        endLoop(reason || "cancelled (manual leave/reconnect)");
      }
      else {
        console.log(
          `[LiveClass] forced-rejoin cancel requested mid-attempt (${
            reason || "manual leave/reconnect"
          }) — will disconnect again as soon as the in-flight attempt settles`
        );
      }
    };

    const scheduleNextAttempt = () => {
      const idx = Math.min(
        attemptRef.current - 1,
        FORCE_REJOIN_RETRY_DELAYS_MS.length - 1
      );
      const delay =
        FORCE_REJOIN_RETRY_DELAYS_MS[idx] ?? FORCE_REJOIN_MAX_RETRY_DELAY_MS;
      clearRetryTimer();
      retryTimerRef.current = setTimeout(attemptRejoin, delay);
    };

    const attemptRejoin = async () => {
      if (inFlightRef.current || cancelledRef.current) return;
      inFlightRef.current = true;
      loopActiveRef.current = true;
      if (!loopStartedAtRef.current) {
        loopStartedAtRef.current = Date.now();
        cancelledRef.current = false;
      }
      if (suppressLeaveNavRef) suppressLeaveNavRef.current = true;

      attemptRef.current += 1;
      const attemptNum = attemptRef.current;
      console.warn(
        `[LiveClass] forced rejoin attempt ${attemptNum} (manual-leave-and-rejoin equivalent)`
      );

      try {
        await room.disconnect();
        await room.connect(wsUrl, token);

        if (cancelledRef.current) {
          // The student clicked Leave while this attempt was mid-flight.
          // We already have a fresh connection at this point (too late
          // to un-connect), so honor their choice now: disconnect again
          // immediately and let the normal onDisconnected -> navigate
          // flow take over, instead of re-emitting Reconnected and
          // pretending everything's fine.
          console.log(
            "[LiveClass] forced rejoin completed but was cancelled mid-flight (user chose to leave) — disconnecting again"
          );
          try {
            await room.disconnect();
          } catch {
            // ignore — best effort
          }
          endLoop("cancelled after in-flight rejoin completed");
          return;
        }

        console.log(
          `[LiveClass] forced rejoin succeeded on attempt ${attemptNum} — replaying RoomEvent.Reconnected so every recovery hook (media state, subscriptions, quality tiers, moderation sync) re-applies itself`
        );
        room.emit(RoomEvent.Reconnected);
        endLoop("succeeded");
      } catch (err) {
        console.error(
          `[LiveClass] forced rejoin attempt ${attemptNum} failed (network likely still down)`,
          err
        );
        inFlightRef.current = false;

        if (cancelledRef.current) {
          endLoop("cancelled while an attempt was in flight");
          return;
        }

        const elapsed = Date.now() - loopStartedAtRef.current;
        if (elapsed >= FORCE_REJOIN_MAX_ELAPSED_MS) {
          endLoop(
            `giving up after ${Math.round(
              elapsed / 1000
            )}s of continuous failure — falling back to the normal disconnected/leave screen instead of spinning forever`
          );
          return;
        }

        // Still suppressing navigation — keep retrying quietly rather
        // than surfacing every failed attempt to the student. Either
        // this backoff timer or the `online` listener below will
        // trigger the next attempt, whichever comes first.
        scheduleNextAttempt();
      }
    };

    const onOnline = () => {
      // The browser reports connectivity is back — jump the queue and
      // try immediately instead of waiting out whatever backoff delay
      // happens to be pending. Only matters once the loop has actually
      // started; an `online` event during normal operation (e.g. the
      // very first page load) should not trigger a reconnect attempt.
      if (!loopActiveRef.current || inFlightRef.current || cancelledRef.current)
        return;
      console.log(
        "[LiveClass] browser reports connectivity restored — retrying rejoin immediately"
      );
      clearRetryTimer();
      attemptRejoin();
    };

    const onReconnecting = () => {
      if (loopActiveRef.current) return; // already mid our own retry loop, don't arm a second one
      clearStuckTimer();
      stuckTimerRef.current = setTimeout(
        attemptRejoin,
        FORCE_REJOIN_TIMEOUT_MS
      );
    };

    const onReconnected = () => {
      // Fires either because LiveKit's own resume succeeded on its own
      // (before our stuck-timer even got a chance to fire), or because
      // of our own synthetic emit right after a successful forced
      // rejoin above (in which case endLoop already ran). Either way,
      // nothing left to wait on.
      clearStuckTimer();
    };

    room.on(RoomEvent.Reconnecting, onReconnecting);
    room.on(RoomEvent.Reconnected, onReconnected);
    window.addEventListener("online", onOnline);

    if (cancelRef) cancelRef.current = cancelLoop;

    return () => {
      clearStuckTimer();
      clearRetryTimer();
      if (suppressLeaveNavRef) suppressLeaveNavRef.current = false;
      room.off(RoomEvent.Reconnecting, onReconnecting);
      room.off(RoomEvent.Reconnected, onReconnected);
      window.removeEventListener("online", onOnline);
      if (cancelRef) cancelRef.current = null;
    };
  }, [room, wsUrl, token, suppressLeaveNavRef, cancelRef]);
}

// A full network drop (not just a brief signal blip) can come back with
// a local camera/mic publication gone, or still marked enabled but with
// no live track attached — LiveKit's automatic reconnect does not
// reliably guarantee local tracks survive a full engine reconnect. This
// is very likely the actual cause of "screen goes black, has to leave
// and rejoin": the room reconnects fine, but camera/mic never come back
// on their own, so nothing is being published, with no obvious way to
// recover short of leaving and rejoining (which forces a fresh
// setCameraEnabled/setMicrophoneEnabled on mount).
//
// Applies to BOTH roles — a student can have their mic (and, via the
// camera control in the bottom bar, their camera) on too, not just the
// teacher. The fix restores whatever was actually on right before the
// drop, not just "always turn things on": it keeps a running record of
// the local participant's real enabled/disabled state, updated live as
// they toggle things (including a teacher's mute-all forcing a
// student's mic off), so a student who was muted stays muted after
// reconnecting, and a teacher/student with camera or mic off stays off
// — only what was genuinely live before the drop gets restored.
//
// Camera restoration here is intentionally MIC-ONLY for moderators
// (isModerator === true): a bare setCameraEnabled(true) with no options
// falls back to whatever the generic top-level LiveKitRoom
// publishDefaults are, which are main-cam-shaped — for a board device
// that would silently regress it from its 1080p/low-framerate profile
// back to the generic 720p main profile after every single reconnect.
// useAdaptiveQuality owns tier-aware camera recovery for moderators (see
// its own Reconnected handler below); this hook stays out of its way and
// only restores the moderator's mic. Students have no tiering concept
// for their camera, so the plain restore is fine and stays as-is for
// them.
function useMediaStateRecovery(isModerator) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const desiredRef = useRef({ camera: false, mic: false });

  useEffect(() => {
    if (!room) return;

    const syncDesired = () => {
      desiredRef.current = {
        camera: localParticipant.isCameraEnabled,
        mic: localParticipant.isMicrophoneEnabled,
      };
    };

    syncDesired();
    localParticipant.on(ParticipantEvent.TrackMuted, syncDesired);
    localParticipant.on(ParticipantEvent.TrackUnmuted, syncDesired);
    localParticipant.on(ParticipantEvent.LocalTrackPublished, syncDesired);
    localParticipant.on(ParticipantEvent.LocalTrackUnpublished, syncDesired);

    const handleReconnected = async () => {
      const desired = desiredRef.current;

      // Camera: only handled here for non-moderators. Moderator camera
      // recovery is owned by useAdaptiveQuality, which knows the correct
      // main/board tier to reapply instead of falling back to generic
      // defaults.
      if (!isModerator) {
        try {
          const camPub = localParticipant.getTrackPublication(
            Track.Source.Camera
          );
          const camLive = camPub?.track && !camPub.track.isMuted;
          if (desired.camera && !camLive) {
            await localParticipant.setCameraEnabled(true);
            console.log(
              "[LiveClass] camera restored to its pre-drop (on) state after reconnect"
            );
          }
          else if (!desired.camera && camLive) {
            await localParticipant.setCameraEnabled(false);
          }
        } catch (err) {
          console.error(
            "[LiveClass] camera restore after reconnect failed",
            err
          );
        }
      }

      try {
        const micPub = localParticipant.getTrackPublication(
          Track.Source.Microphone
        );
        const micLive = micPub?.track && !micPub.track.isMuted;
        if (desired.mic && !micLive) {
          await localParticipant.setMicrophoneEnabled(true);
          console.log(
            "[LiveClass] mic restored to its pre-drop (on) state after reconnect"
          );
        }
        else if (!desired.mic && micLive) {
          await localParticipant.setMicrophoneEnabled(false);
        }
      } catch (err) {
        console.error("[LiveClass] mic restore after reconnect failed", err);
      }
    };

    room.on(RoomEvent.Reconnected, handleReconnected);
    return () => {
      localParticipant.off(ParticipantEvent.TrackMuted, syncDesired);
      localParticipant.off(ParticipantEvent.TrackUnmuted, syncDesired);
      localParticipant.off(ParticipantEvent.LocalTrackPublished, syncDesired);
      localParticipant.off(ParticipantEvent.LocalTrackUnpublished, syncDesired);
      room.off(RoomEvent.Reconnected, handleReconnected);
    };
  }, [room, localParticipant, isModerator]);
}

function useSharpCameraContentHint(isModerator) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!isModerator) return;

    const applyHint = () => {
      const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
      const mediaTrack = camPub?.track?.mediaStreamTrack;
      if (mediaTrack && "contentHint" in mediaTrack) {
        mediaTrack.contentHint = "detail";
        const settings = mediaTrack.getSettings();
        console.log(
          "[Camera] Actual capture:",
          settings.width,
          "x",
          settings.height,
          "@",
          settings.frameRate,
          "fps"
        );
      }
    };

    applyHint();
    localParticipant.on("localTrackPublished", applyHint);
    return () => localParticipant.off("localTrackPublished", applyHint);
  }, [isModerator, localParticipant]);
}

const CAMERA_RECOVERY_DELAY_MS = 2000;

function useCameraRecovery(isModerator) {
  const { localParticipant } = useLocalParticipant();
  const recoveryTimerRef = useRef(null);

  useEffect(() => {
    if (!isModerator) return;

    const clearRecoveryTimer = () => {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    };

    const attemptRecovery = async () => {
      const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
      if (!camPub || !camPub.isMuted) return;
      try {
        await localParticipant.setCameraEnabled(true);
        console.log(
          "[LiveClass] camera recovery: re-enabled after sustained mute"
        );
      } catch (err) {
        console.error("[LiveClass] camera recovery failed", err);
      }
    };

    const handleTrackMuted = (pub) => {
      if (pub.source !== Track.Source.Camera) return;
      clearRecoveryTimer();
      recoveryTimerRef.current = setTimeout(
        attemptRecovery,
        CAMERA_RECOVERY_DELAY_MS
      );
    };

    const handleTrackUnmuted = (pub) => {
      if (pub.source !== Track.Source.Camera) return;
      clearRecoveryTimer();
    };

    localParticipant.on(ParticipantEvent.TrackMuted, handleTrackMuted);
    localParticipant.on(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);

    return () => {
      localParticipant.off(ParticipantEvent.TrackMuted, handleTrackMuted);
      localParticipant.off(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);
      clearRecoveryTimer();
    };
  }, [isModerator, localParticipant]);
}

// Students only need the teacher's video tracks — never other students'
// cameras, since those are never rendered. Cuts wasted download
// bandwidth. Audio stays auto-subscribed for everyone (a student may
// unmute to ask a question and should be heard).
//
// Re-applied on RoomEvent.Reconnected in addition to the original
// TrackPublished/ParticipantConnected triggers: LiveKit's own reconnect
// does not reliably guarantee this app's custom subscription choices
// (as opposed to the default "subscribe to everything") survive a full
// engine reconnect.
function useManagedSubscriptions(isModerator) {
  const room = useRoomContext();

  useEffect(() => {
    if (isModerator) return; // teacher needs every camera for the grid

    const applyRule = (participant) => {
      participant.trackPublications.forEach((pub) => {
        if (pub.kind === Track.Kind.Video) {
          const isTeacher = participant.identity.startsWith("teacher-");
          if (pub.isSubscribed !== isTeacher) {
            pub.setSubscribed(isTeacher);
          }
        }
      });
    };

    const applyToAll = () => room.remoteParticipants.forEach(applyRule);

    applyToAll();

    const onPublished = (_pub, participant) => applyRule(participant);
    const onConnected = (participant) => applyRule(participant);
    const onReconnected = () => {
      console.log(
        "[LiveClass] reconnected — re-applying teacher-only video subscription rule"
      );
      applyToAll();
    };

    room.on(RoomEvent.TrackPublished, onPublished);
    room.on(RoomEvent.ParticipantConnected, onConnected);
    room.on(RoomEvent.Reconnected, onReconnected);

    return () => {
      room.off(RoomEvent.TrackPublished, onPublished);
      room.off(RoomEvent.ParticipantConnected, onConnected);
      room.off(RoomEvent.Reconnected, onReconnected);
    };
  }, [room, isModerator]);
}

const PIN_SUBSCRIPTION_DEBOUNCE_MS = 500;

function useTeacherSubscriptionThrottle(isModerator, pinned) {
  const room = useRoomContext();

  useEffect(() => {
    if (!isModerator) return;

    const applyRule = (participant) => {
      const isStudent = !participant.identity.startsWith("teacher-");
      if (!isStudent) return; // never touch other teacher devices (board/main/etc.)

      participant.trackPublications.forEach((pub) => {
        if (pub.kind !== Track.Kind.Video) return;
        const shouldSubscribe = !pinned; // only need student video when the grid is visible
        if (pub.isSubscribed !== shouldSubscribe) {
          pub.setSubscribed(shouldSubscribe);
        }
      });
    };

    const applyToAll = () => room.remoteParticipants.forEach(applyRule);

    const debounceTimer = setTimeout(applyToAll, PIN_SUBSCRIPTION_DEBOUNCE_MS);

    const onPublished = (_pub, participant) => applyRule(participant);
    const onConnected = (participant) => applyRule(participant);
    const onReconnected = () => {
      console.log(
        "[LiveClass] reconnected — re-applying pinned-state subscription throttle"
      );
      applyToAll();
    };

    room.on(RoomEvent.TrackPublished, onPublished);
    room.on(RoomEvent.ParticipantConnected, onConnected);
    room.on(RoomEvent.Reconnected, onReconnected);

    return () => {
      clearTimeout(debounceTimer);
      room.off(RoomEvent.TrackPublished, onPublished);
      room.off(RoomEvent.ParticipantConnected, onConnected);
      room.off(RoomEvent.Reconnected, onReconnected);
    };
  }, [room, isModerator, pinned]);
}

// Main (talking-head) camera tiers — tuned for a mostly-moving subject:
// higher framerate matters more than squeezing out every last pixel of
// spatial detail, since motion smoothness is what a face-cam viewer
// actually notices.
const MAIN_ADAPTIVE_TIERS = {
  high: {
    resolution: VideoPresets.h720.resolution,
    encoding: { maxBitrate: 1_600_000, maxFramerate: 30 },
    simulcastLayers: [
      { ...VideoPresets.h720, scalabilityMode: "L1T3" },
      { ...VideoPresets.h540, scalabilityMode: "L1T3" },
      { ...VideoPresets.h360, scalabilityMode: "L1T3" },
    ],
  },
  medium: {
    resolution: VideoPresets.h540.resolution,
    encoding: { maxBitrate: 900_000, maxFramerate: 24 },
    simulcastLayers: [
      { ...VideoPresets.h360, scalabilityMode: "L1T3" },
      { ...VideoPresets.h180, scalabilityMode: "L1T3" },
    ],
  },
  low: {
    resolution: VideoPresets.h360.resolution,
    encoding: { maxBitrate: 400_000, maxFramerate: 15 },
    simulcastLayers: [{ ...VideoPresets.h180, scalabilityMode: "L1T3" }],
  },
};

// Board/whiteboard camera tiers — tuned for the opposite tradeoff:
// content is nearly static (handwriting, diagrams) so framerate barely
// matters, but fine strokes/small text need real spatial resolution and
// bitrate to stay legible instead of turning into compression mush.
//
// NOTE: this is unrelated to the NEW `features/whiteboard` Excalidraw
// board added in this update — "board" here still means the physical
// second camera pointed at a real whiteboard/desk. The two "boards"
// are coincidentally named the same thing; keep that straight when
// reading this file.
const BOARD_ADAPTIVE_TIERS = {
  high: {
    resolution: VideoPresets.h1080.resolution,
    encoding: { maxBitrate: 2_500_000, maxFramerate: 10 },
    simulcastLayers: [
      { ...VideoPresets.h1080, scalabilityMode: "L1T3" },
      { ...VideoPresets.h540, scalabilityMode: "L1T3" },
      { ...VideoPresets.h360, scalabilityMode: "L1T3" },
    ],
  },
  medium: {
    resolution: VideoPresets.h720.resolution,
    encoding: { maxBitrate: 1_200_000, maxFramerate: 10 },
    simulcastLayers: [
      { ...VideoPresets.h540, scalabilityMode: "L1T3" },
      { ...VideoPresets.h360, scalabilityMode: "L1T3" },
    ],
  },
  low: {
    resolution: VideoPresets.h360.resolution,
    encoding: { maxBitrate: 600_000, maxFramerate: 8 },
    simulcastLayers: [{ ...VideoPresets.h180, scalabilityMode: "L1T3" }],
  },
};

const TIER_RANK = { low: 0, medium: 1, high: 2 };
const DOWNGRADE_DEBOUNCE_MS = 8000;
const UPGRADE_DEBOUNCE_MS = 30000;

function tierForQuality(quality) {
  if (
    quality === ConnectionQuality.Excellent ||
    quality === ConnectionQuality.Good
  ) {
    return "high";
  }
  if (quality === ConnectionQuality.Poor) return "medium";
  if (quality === ConnectionQuality.Lost) return "low";
  return "medium";
}

function useAdaptiveQuality(isModerator) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const stableIdentity = useStableLocalIdentity();
  const currentTierRef = useRef("high");
  const lastQualityRef = useRef(null);
  const debounceRef = useRef(null);
  const pendingTierRef = useRef(null);
  const applyingRef = useRef(false);

  useEffect(() => {
    if (!isModerator) return;
    if (!stableIdentity) return; // identity not resolved yet — wait for it rather than guessing

    const isBoardDevice = getDeviceRole(stableIdentity) === "board";
    const TIERS = isBoardDevice ? BOARD_ADAPTIVE_TIERS : MAIN_ADAPTIVE_TIERS;

    const applyTier = async (tierName, options) => {
      const force = options?.force === true;
      if (currentTierRef.current === tierName && !force) return;
      if (applyingRef.current) return;

      const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
      if (!camPub || !camPub.isEnabled) return;

      const tier = TIERS[tierName];
      applyingRef.current = true;
      try {
        await localParticipant.setCameraEnabled(
          true,
          { resolution: tier.resolution },
          {
            videoEncoding: tier.encoding,
            simulcast: true,
            videoSimulcastLayers: tier.simulcastLayers,
            degradationPreference: "maintain-resolution",
          }
        );
        currentTierRef.current = tierName;
        console.log(
          `[LiveClass] adaptive quality -> ${tierName}${
            force ? " (forced reassert)" : ""
          }`
        );
      } catch (err) {
        console.error("[LiveClass] adaptive quality: republish failed", err);
      } finally {
        applyingRef.current = false;
        pendingTierRef.current = null;
      }
    };

    const handleQualityChanged = (quality, participant) => {
      if (participant.identity !== localParticipant.identity) return;

      console.log("[LiveClass] connection quality event:", quality);

      if (quality === lastQualityRef.current) return;
      lastQualityRef.current = quality;

      const targetTier = tierForQuality(quality);
      const targetRank = TIER_RANK[targetTier];
      const currentRank = TIER_RANK[currentTierRef.current];

      if (targetRank === currentRank) return;

      if (targetRank < currentRank) {
        clearTimeout(debounceRef.current);
        pendingTierRef.current = targetTier;
        debounceRef.current = setTimeout(() => {
          applyTier(targetTier);
        }, DOWNGRADE_DEBOUNCE_MS);
        return;
      }

      if (
        pendingTierRef.current &&
        TIER_RANK[pendingTierRef.current] >= targetRank
      ) {
        return;
      }

      clearTimeout(debounceRef.current);
      pendingTierRef.current = targetTier;
      debounceRef.current = setTimeout(() => {
        applyTier(targetTier);
      }, UPGRADE_DEBOUNCE_MS);
    };

    const handleReconnected = () => {
      applyTier(currentTierRef.current, { force: true });
    };
    room.on(RoomEvent.Reconnected, handleReconnected);

    room.on(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
      room.off(RoomEvent.Reconnected, handleReconnected);
      clearTimeout(debounceRef.current);
    };
  }, [room, localParticipant, isModerator, stableIdentity]);
}

async function logActualCameraSettings(
  localParticipant,
  tag,
  requestedWidth,
  requestedHeight
) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
  const settings = camPub?.track?.mediaStreamTrack?.getSettings();
  if (!settings) {
    console.warn(
      `[LiveClass] ${tag}: no live track to read settled resolution from`
    );
    return;
  }
  const met =
    settings.width >= requestedWidth && settings.height >= requestedHeight;
  console.log(
    `[LiveClass] ${tag}: requested ${requestedWidth}x${requestedHeight}, ACTUAL settled resolution ${settings.width}x${settings.height} @ ${settings.frameRate}fps`,
    met
      ? "(met or exceeded request)"
      : "(FELL SHORT of request — likely a hardware/OS/driver cap, not a code issue)"
  );
}

function useBoardCamInitialQuality(isModerator) {
  const { localParticipant } = useLocalParticipant();
  const stableIdentity = useStableLocalIdentity();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!isModerator) return;
    if (!stableIdentity) return;
    if (getDeviceRole(stableIdentity) !== "board") return;

    const applyBoardProfile = async () => {
      if (appliedRef.current) return;
      const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
      if (!camPub || !camPub.isEnabled) {
        console.log(
          "[LiveClass] board cam: camera not published yet, will retry on localTrackPublished"
        );
        return;
      }

      const tier = BOARD_ADAPTIVE_TIERS.high;
      try {
        await localParticipant.setCameraEnabled(
          true,
          { resolution: tier.resolution },
          {
            videoEncoding: tier.encoding,
            simulcast: true,
            videoSimulcastLayers: tier.simulcastLayers,
            degradationPreference: "maintain-resolution",
          }
        );
        appliedRef.current = true;
        console.log(
          "[LiveClass] board cam: applied high-detail 1080p profile (request sent — checking what actually settled below)"
        );
        logActualCameraSettings(
          localParticipant,
          "board cam initial upgrade",
          tier.resolution.width,
          tier.resolution.height
        );
      } catch (err) {
        console.error(
          "[LiveClass] board cam: initial quality upgrade failed",
          err
        );
      }
    };

    applyBoardProfile();
    localParticipant.on("localTrackPublished", applyBoardProfile);
    return () => localParticipant.off("localTrackPublished", applyBoardProfile);
  }, [isModerator, localParticipant, stableIdentity]);
}

function useBandwidthMonitoring() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;
    const handleQualityUpdate = () => {};
    room.on(RoomEvent.ConnectionQualityChanged, handleQualityUpdate);
    return () =>
      room.off(RoomEvent.ConnectionQualityChanged, handleQualityUpdate);
  }, [room]);
}

function useFrameQualityMonitoring(trackRef) {
  useEffect(() => {
    if (!trackRef) return;

    const checkFrameQuality = () => {
      const pub = trackRef.publication;
      const dims = pub?.dimensions;
      const quality = pub?.videoQuality;
      const track = trackRef.track;
      const settings = track?.mediaStreamTrack?.getSettings();
      if (dims) {
        console.log(
          "[Frame Quality] Publication dimensions:",
          dims.width,
          "x",
          dims.height,
          "quality:",
          quality
        );
      }
      if (settings) {
        console.log(
          "[Frame Quality] MediaStreamTrack settings:",
          settings.width,
          "x",
          settings.height,
          "@",
          settings.frameRate,
          "fps"
        );
      }
      if (!dims && !settings) {
        console.log("[Frame Quality] No dimensions available yet");
      }
    };

    checkFrameQuality();
    const interval = setInterval(checkFrameQuality, 3000);
    return () => clearInterval(interval);
  }, [trackRef]);
}

/* ============================================================
   Per-participant camera/mic status (Google-Meet-style icons)
   ============================================================ */

// Reads whether a participant's camera/mic are currently "on" from
// state that's already sitting in the local Room object — no
// subscription, no extra bandwidth. A track counts as "on" only if a
// publication exists AND it isn't muted; a participant who never
// published a camera at all and one who published then muted it both
// read as "off" here, matching how Google Meet collapses those two
// cases into the same icon. Works for the local participant or any
// remote participant — ParticipantEvent fires on both.
function useParticipantMediaState(participant) {
  const getState = useCallback(() => {
    if (!participant) return { cameraOn: false, micOn: false };
    const camPub = participant.getTrackPublication(Track.Source.Camera);
    const micPub = participant.getTrackPublication(Track.Source.Microphone);
    return {
      cameraOn: !!camPub && !camPub.isMuted,
      micOn: !!micPub && !micPub.isMuted,
    };
  }, [participant]);

  const [state, setState] = useState(getState);

  useEffect(() => {
    if (!participant) return;
    const update = () => setState(getState());
    update();

    participant.on(ParticipantEvent.TrackMuted, update);
    participant.on(ParticipantEvent.TrackUnmuted, update);
    participant.on(ParticipantEvent.TrackPublished, update);
    participant.on(ParticipantEvent.TrackUnpublished, update);
    // Local-only events (no-ops on remote participants, harmless to attach)
    participant.on(ParticipantEvent.LocalTrackPublished, update);
    participant.on(ParticipantEvent.LocalTrackUnpublished, update);

    return () => {
      participant.off(ParticipantEvent.TrackMuted, update);
      participant.off(ParticipantEvent.TrackUnmuted, update);
      participant.off(ParticipantEvent.TrackPublished, update);
      participant.off(ParticipantEvent.TrackUnpublished, update);
      participant.off(ParticipantEvent.LocalTrackPublished, update);
      participant.off(ParticipantEvent.LocalTrackUnpublished, update);
    };
  }, [participant, getState]);

  return state;
}

// Small bottom-right badge pair on a grid tile: mic + camera state,
// red when off, matching the familiar Google Meet convention. Purely
// presentational — costs one small subscription to already-arriving
// participant events per tile.
function MediaStatusIcons({ participant }) {
  const { cameraOn, micOn } = useParticipantMediaState(participant);

  return (
    <div className="absolute bottom-1 right-1 z-10 flex items-center gap-1">
      <span
        title={micOn ? "Mic on" : "Mic off"}
        className={`flex items-center justify-center w-5 h-5 rounded-full ${
          micOn ? "bg-black/60" : "bg-red-600"
        }`}
      >
        {micOn ? (
          <Mic size={11} className="text-white" />
        ) : (
          <MicOff size={11} className="text-white" />
        )}
      </span>
      <span
        title={cameraOn ? "Camera on" : "Camera off"}
        className={`flex items-center justify-center w-5 h-5 rounded-full ${
          cameraOn ? "bg-black/60" : "bg-red-600"
        }`}
      >
        {cameraOn ? (
          <Video size={11} className="text-white" />
        ) : (
          <VideoOff size={11} className="text-white" />
        )}
      </span>
    </div>
  );
}

/* ============================================================
   Moderation context
   ============================================================ */

const ModerationContext = createContext(null);
const useModeration = () => useContext(ModerationContext);

// `onWhiteboardOpenChange` — callback prop. LiveClassRoom (the
// component that owns the fullscreen/portrait CSS-rotation decision)
// needs to know whether the whiteboard is open, but whiteboardOpen
// state lives in here because it has to be inside <LiveKitRoom> (it's
// broadcast/synced over the room's data channel). Rather than lifting
// the whole broadcast/sync mechanism out, we just mirror the boolean
// up via this callback — see the effect right after whiteboardOpen's
// declaration below, and LiveClassRoom's onWhiteboardOpenChange usage.
function ModerationProvider({
  isModerator,
  onClassEnded,
  onWhiteboardOpenChange,
  children,
}) {
  const room = useRoomContext();
  const [raisedHands, setRaisedHands] = useState({});
  const [pinned, setPinned] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const [micLocked, setMicLocked] = useState(false);
  // Whether the Excalidraw whiteboard panel is currently open for the
  // whole class. Broadcast the same way as pinned/micLocked: the
  // teacher toggles it, everyone else follows via "whiteboard-open" /
  // "whiteboard-close" messages, and it's included in sync-state so
  // late joiners / reconnecting students land in the right state.
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  const pinnedRef = useRef(pinned);
  const micLockedRef = useRef(micLocked);
  const raisedHandsRef = useRef(raisedHands);
  const whiteboardOpenRef = useRef(whiteboardOpen);
  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);
  useEffect(() => {
    micLockedRef.current = micLocked;
  }, [micLocked]);
  useEffect(() => {
    raisedHandsRef.current = raisedHands;
  }, [raisedHands]);
  useEffect(() => {
    whiteboardOpenRef.current = whiteboardOpen;
  }, [whiteboardOpen]);

  // Mirror whiteboardOpen up to the root component (see the block
  // comment above ModerationProvider). Fires for every source of a
  // whiteboardOpen change — local toggleWhiteboard(), an incoming
  // "whiteboard-open"/"whiteboard-close" message, and sync-state on
  // join/reconnect — since all of them funnel through this same piece
  // of state.
  useEffect(() => {
    onWhiteboardOpenChange?.(whiteboardOpen);
  }, [whiteboardOpen, onWhiteboardOpenChange]);

  const syncedRef = useRef(false);

  useEffect(() => {
    const decoder = new TextDecoder();

    const handleData = (payload, participant) => {
      let msg;
      try {
        msg = JSON.parse(decoder.decode(payload));
      } catch (err) {
        console.warn("[LiveClass] handleData: failed to parse payload", err);
        return;
      }

      switch (msg.type) {
        case "raise-hand": {
          const id = msg.identity || participant?.identity;
          if (!id) return;
          setRaisedHands((prev) => {
            const next = { ...prev };
            if (msg.raised) next[id] = msg.name || participant?.name || id;
            else delete next[id];
            raisedHandsRef.current = next;
            return next;
          });
          break;
        }
        case "pin": {
          const nextPinned = msg.identity
            ? { identity: msg.identity, source: msg.source || "camera" }
            : null;
          pinnedRef.current = nextPinned;
          setPinned(nextPinned);
          break;
        }
        case "mute-all": {
          micLockedRef.current = true;
          setMicLocked(true);
          if (!isModerator) {
            room.localParticipant
              .setMicrophoneEnabled(false)
              .catch((err) =>
                console.error(
                  "[LiveClass] mute-all: failed to disable mic",
                  err
                )
              );
          }
          break;
        }
        case "unmute-all": {
          micLockedRef.current = false;
          setMicLocked(false);
          break;
        }
        // Broadcast when the teacher opens/closes the whiteboard for
        // everyone. Students never send these — see toggleWhiteboard
        // below, which is a no-op for non-moderators.
        case "whiteboard-open": {
          whiteboardOpenRef.current = true;
          setWhiteboardOpen(true);
          break;
        }
        case "whiteboard-close": {
          whiteboardOpenRef.current = false;
          setWhiteboardOpen(false);
          break;
        }
        case "request-sync": {
          if (!isModerator) return;
          const requesterId = participant?.identity;
          if (!requesterId) return;
          safePublish(
            room,
            {
              type: "sync-state",
              pinned: pinnedRef.current,
              micLocked: micLockedRef.current,
              raisedHands: raisedHandsRef.current,
              whiteboardOpen: whiteboardOpenRef.current,
            },
            [requesterId]
          );
          break;
        }
        case "sync-state": {
          syncedRef.current = true;
          const nextPinned = msg.pinned
            ? {
                identity: msg.pinned.identity,
                source: msg.pinned.source || "camera",
              }
            : null;
          const nextMicLocked = !!msg.micLocked;
          const nextRaisedHands = msg.raisedHands || {};
          const nextWhiteboardOpen = !!msg.whiteboardOpen;
          pinnedRef.current = nextPinned;
          micLockedRef.current = nextMicLocked;
          raisedHandsRef.current = nextRaisedHands;
          whiteboardOpenRef.current = nextWhiteboardOpen;
          setPinned(nextPinned);
          setMicLocked(nextMicLocked);
          setRaisedHands(nextRaisedHands);
          setWhiteboardOpen(nextWhiteboardOpen);
          if (!isModerator && msg.micLocked) {
            room.localParticipant
              .setMicrophoneEnabled(false)
              .catch((err) =>
                console.error(
                  "[LiveClass] sync-state: failed to disable mic",
                  err
                )
              );
          }
          break;
        }
        case "class-ended": {
          onClassEnded();
          break;
        }
        default:
          break;
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => room.off(RoomEvent.DataReceived, handleData);
  }, [room, isModerator, onClassEnded]);

  useEffect(() => {
    if (!isModerator) return;

    const sendSyncState = (participant) => {
      if (!participant?.identity) return;
      safePublish(
        room,
        {
          type: "sync-state",
          pinned: pinnedRef.current,
          micLocked: micLockedRef.current,
          raisedHands: raisedHandsRef.current,
          whiteboardOpen: whiteboardOpenRef.current,
        },
        [participant.identity]
      );
    };

    room.on(RoomEvent.ParticipantConnected, sendSyncState);

    const rebroadcastOnReconnect = () => {
      safePublish(room, {
        type: "sync-state",
        pinned: pinnedRef.current,
        micLocked: micLockedRef.current,
        raisedHands: raisedHandsRef.current,
        whiteboardOpen: whiteboardOpenRef.current,
      });
    };
    room.on(RoomEvent.Reconnected, rebroadcastOnReconnect);

    return () => {
      room.off(RoomEvent.ParticipantConnected, sendSyncState);
      room.off(RoomEvent.Reconnected, rebroadcastOnReconnect);
    };
  }, [room, isModerator]);

  useEffect(() => {
    if (isModerator) return;

    syncedRef.current = false;

    const requestSync = () => {
      if (syncedRef.current) return;
      safePublish(room, { type: "request-sync" });
    };

    requestSync();
    const retry1 = setTimeout(requestSync, 1500);
    const retry2 = setTimeout(requestSync, 4000);

    const onReconnected = () => {
      syncedRef.current = false;
      requestSync();
    };
    room.on(RoomEvent.Reconnected, onReconnected);

    return () => {
      clearTimeout(retry1);
      clearTimeout(retry2);
      room.off(RoomEvent.Reconnected, onReconnected);
    };
  }, [room, isModerator]);

  const toggleHand = useCallback(() => {
    setHandRaised((prev) => {
      const next = !prev;
      safePublish(room, {
        type: "raise-hand",
        raised: next,
        identity: room.localParticipant.identity,
        name: room.localParticipant.name,
      });
      return next;
    });
  }, [room]);

  const pin = useCallback(
    (identity, source = "camera") => {
      if (!isModerator) return;
      const nextPinned = identity ? { identity, source } : null;
      pinnedRef.current = nextPinned;
      setPinned(nextPinned);
      safePublish(room, { type: "pin", identity, source });
    },
    [room, isModerator]
  );

  const toggleMuteAll = useCallback(() => {
    if (!isModerator) return;
    const next = !micLocked;
    micLockedRef.current = next;
    setMicLocked(next);
    safePublish(room, { type: next ? "mute-all" : "unmute-all" });
  }, [room, isModerator, micLocked]);

  // Teacher-only. Opens/closes the whiteboard for the entire class.
  // Students receive this via "whiteboard-open"/"whiteboard-close" in
  // handleData above (and via sync-state on join/reconnect), so this
  // never needs to be called by a student — the no-op guard here is
  // just a safety net in case a student's client somehow calls it.
  const toggleWhiteboard = useCallback(() => {
    if (!isModerator) return;
    const next = !whiteboardOpenRef.current;
    whiteboardOpenRef.current = next;
    setWhiteboardOpen(next);
    safePublish(room, { type: next ? "whiteboard-open" : "whiteboard-close" });
  }, [room, isModerator]);

  return (
    <ModerationContext.Provider
      value={{
        raisedHands,
        pinned,
        handRaised,
        toggleHand,
        pin,
        micLocked,
        toggleMuteAll,
        whiteboardOpen,
        toggleWhiteboard,
      }}
    >
      {children}
    </ModerationContext.Provider>
  );
}

/* ============================================================
   Auto-hide / toggle controls
   ============================================================ */

function useAutoHideControls(timeoutMs = 8000) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const clearTimer = () => clearTimeout(timerRef.current);

  const show = useCallback(() => {
    setVisible(true);
    clearTimer();
    timerRef.current = setTimeout(() => setVisible(false), timeoutMs);
  }, [timeoutMs]);

  const toggle = useCallback(() => {
    setVisible((prev) => {
      if (prev) {
        clearTimer();
        return false;
      }
      clearTimer();
      timerRef.current = setTimeout(() => setVisible(false), timeoutMs);
      return true;
    });
  }, [timeoutMs]);

  useEffect(() => {
    show();
    return () => clearTimer();
  }, [show]);

  return { visible, toggle };
}

/* ============================================================
   Student video-quality picker (YouTube-style)
   ============================================================ */

// "auto" means "let the app decide" — this preserves every bit of the
// existing adaptive/forced-quality behavior untouched (board cam
// pinned HIGH, main cam adapting to this student's own connection).
// Any other value is an explicit override the student picked because
// they know something the network heuristics don't (e.g. "I'm on
// limited mobile data, please don't burn it on 1080p board video").
// Labels show real resolution numbers (YouTube-style) rather than
// vague High/Medium/Low. Written as a range, not one fixed number,
// because setVideoQuality doesn't itself carry a resolution — it asks
// for a simulcast layer (HIGH/MEDIUM/LOW), and what that layer actually
// decodes to depends on which camera is on screen: the main/face cam
// tops out at 720p (MAIN_ADAPTIVE_TIERS.high), the board cam at 1080p
// (BOARD_ADAPTIVE_TIERS.high) since handwriting needs the extra detail.
// A single flat "720p" label would be simply wrong whenever the board
// cam is what's showing, so the range covers both truthfully.
const QUALITY_LEVELS = {
  auto: { label: "Auto", quality: null },
  high: { label: "High", quality: VideoQuality.HIGH },
  medium: { label: "Medium", quality: VideoQuality.MEDIUM },
  low: { label: "Low (data saver)", quality: VideoQuality.LOW },
};

const STUDENT_QUALITY_STORAGE_KEY = "liveclass:studentVideoQuality";

// Persists the choice in localStorage (not room/session state) so it's
// purely a per-device viewing preference, remembered across classes —
// same spirit as YouTube remembering your last-picked resolution.
function useStudentQualityPreference() {
  const [quality, setQuality] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STUDENT_QUALITY_STORAGE_KEY);
      return stored && QUALITY_LEVELS[stored] ? stored : "auto";
    } catch {
      return "auto";
    }
  });

  const updateQuality = useCallback((next) => {
    setQuality(next);
    try {
      window.localStorage.setItem(STUDENT_QUALITY_STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — the pick still works for
      // this session, it just won't be remembered next time.
    }
  }, []);

  return [quality, updateQuality];
}

// Small gear icon, top-right of the stage, that opens a short list of
// quality options — tapping an option applies it and closes the
// popover immediately; there's also an explicit X to close without
// changing anything.
function QualitySettingsControl({ quality, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-20">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        title="Video quality"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 w-52 bg-neutral-900 border border-white/10 rounded-lg shadow-lg overflow-hidden text-white"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white/70">
              Video quality
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close"
              className="text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          {Object.entries(QUALITY_LEVELS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false); // selecting an option closes the popover
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
                quality === key ? "text-blue-400 font-medium" : "text-white/90"
              }`}
            >
              {quality === key ? "● " : ""}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MicButton({ isModerator }) {
  const { localParticipant } = useLocalParticipant();
  const { micLocked } = useModeration();
  const micOn = localParticipant.isMicrophoneEnabled;
  const [toggling, setToggling] = useState(false);

  const locked = !isModerator && micLocked;

  const handleClick = async () => {
    if (locked || toggling) return;
    setToggling(true);
    try {
      await localParticipant.setMicrophoneEnabled(!micOn);
    } catch (err) {
      console.error("[LiveClass] mic toggle failed", err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={locked || toggling}
      title={locked ? "Muted by teacher" : "Your microphone"}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
        locked
          ? "bg-neutral-700 text-white/50 cursor-not-allowed"
          : micOn
          ? "bg-neutral-800/90 text-white hover:bg-neutral-700"
          : "bg-red-600 text-white"
      }`}
    >
      {micOn ? <Mic size={16} /> : <MicOff size={16} />}
      {locked
        ? "Muted by teacher"
        : toggling
        ? "..."
        : micOn
        ? "My Mic"
        : "Unmute Me"}
    </button>
  );
}

/* ============================================================
   Confirm dialog
   ============================================================ */

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="bg-neutral-900 border border-white/10 rounded-xl p-5 w-[90%] max-w-sm text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-semibold text-base mb-2">{title}</div>
        <div className="text-sm text-white/70 mb-5">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/20 hover:bg-white/10"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
/* ============================================================
   Bottom bar
   ============================================================ */

function BottomBar({
  isModerator,
  liveClassId,
  onEnded,
  forcedRejoinCancelRef,
}) {
  const room = useRoomContext();
  const {
    handRaised,
    toggleHand,
    micLocked,
    toggleMuteAll,
    whiteboardOpen,
    toggleWhiteboard,
  } = useModeration();
  const [ending, setEnding] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ControlBar's screen-share toggle checks livekit-client's own
  // supportsScreenSharing() (essentially "does
  // navigator.mediaDevices.getDisplayMedia exist"), and silently hides
  // the button — no error, no message — the moment it doesn't, REGARDLESS
  // of the screenShare:true prop passed below. Most mobile browsers
  // (iOS Safari always, most Android mobile browsers) never implement
  // the Screen Capture API at all, so a teacher joining from a phone's
  // browser is missing the button not due to a bug here, but because
  // the underlying platform genuinely can't do it. We can't add a
  // capability the browser doesn't have, and — per product decision —
  // we also don't want to occupy bottom-bar space explaining that when
  // it's unavailable: when the platform doesn't support screen share,
  // this simply renders nothing (see the JSX below, which is gated
  // entirely behind supportsScreenShare and shows nothing otherwise).
  const supportsScreenShare = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function",
    []
  );

  // Both of these are genuine "the user wants out" actions, so both
  // must cancel the forced-rejoin retry loop BEFORE disconnecting.
  // Otherwise, if a retry is mid-backoff (or, worse, mid-flight) at the
  // moment of the click, suppressLeaveNavRef is still true, this
  // disconnect() gets silently swallowed by handleLeave, and the queued
  // retry reconnects the user right back in a moment later — the click
  // would appear to do nothing. See useForcedRejoinFallback's cancelLoop
  // for how the in-flight case is handled.
  const doLeave = useCallback(() => {
    forcedRejoinCancelRef?.current?.("manual leave");
    room.disconnect();
  }, [room, forcedRejoinCancelRef]);

  const doReconnect = useCallback(() => {
    forcedRejoinCancelRef?.current?.("manual leave-and-reconnect");
    room.disconnect();
  }, [room, forcedRejoinCancelRef]);

  const doEnd = useCallback(async () => {
    if (ending) return;
    setEnding(true);
    try {
      await endLiveClass(liveClassId);
    } catch {
      // ignore
    }
    onEnded();
  }, [ending, liveClassId, onEnded]);

  const confirmConfig = {
    leave: {
      title: "Leave class?",
      message: "You can rejoin anytime before the class ends.",
      confirmLabel: "Leave",
      danger: true,
      run: doLeave,
    },
    reconnect: {
      title: "Leave and reconnect?",
      message:
        "This disconnects your current session. Use this only if you're having connection issues.",
      confirmLabel: "Leave",
      danger: true,
      run: doReconnect,
    },
    end: {
      title: "End class for everyone?",
      message:
        "This disconnects all students and marks the class as completed. This cannot be undone.",
      confirmLabel: "End Class",
      danger: true,
      run: doEnd,
    },
  };

  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 flex-wrap justify-center px-2">
        {isModerator && (
          <>
            <button
              type="button"
              onClick={toggleMuteAll}
              title="Mutes/unmutes every student"
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                micLocked
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800/90 text-white hover:bg-neutral-700"
              }`}
            >
              {micLocked ? "🔒 Unmute All Students" : "Mute All Students"}
            </button>

            <button
              type="button"
              onClick={toggleWhiteboard}
              title="Opens/closes the whiteboard for the whole class"
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                whiteboardOpen
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800/90 text-white hover:bg-neutral-700"
              }`}
            >
              <PenLine size={16} />
              {whiteboardOpen ? "Close Whiteboard" : "Whiteboard"}
            </button>

            <div className="w-px h-6 bg-white/15 mx-1" />
          </>
        )}

        <MicButton isModerator={isModerator} />

        {!isModerator && (
          <>
            <button
              type="button"
              onClick={toggleHand}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                handRaised
                  ? "bg-yellow-400 text-black"
                  : "bg-neutral-800/90 text-white hover:bg-neutral-700"
              }`}
            >
              <Hand size={16} />
              {handRaised ? "Lower Hand" : "Raise Hand"}
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction("leave")}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Leave Class
            </button>
          </>
        )}

        <ControlBar
          controls={{
            microphone: false,
            camera: true,
            screenShare: isModerator && supportsScreenShare,
            chat: false,
            leave: false,
          }}
          variation="minimal"
        />

        {/* Screen Share unavailable: renders nothing at all rather than
            an explanatory disabled button, per product decision — a
            missing button reads fine on a phone; a wide disabled button
            explaining why just eats bottom-bar space on every mobile
            teacher session where it can never be used anyway. */}

        {isModerator && (
          <>
            <button
              type="button"
              onClick={() => setConfirmAction("reconnect")}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Leave (Reconnect)
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction("end")}
              disabled={ending}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-60"
            >
              <LogOut size={16} />
              {ending ? "Ending..." : "End Class"}
            </button>
          </>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmConfig[confirmAction].title}
          message={confirmConfig[confirmAction].message}
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          danger={confirmConfig[confirmAction].danger}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            setConfirmAction(null);
            confirmConfig[confirmAction].run();
          }}
        />
      )}
    </>
  );
}

/* ============================================================
   Raised-hands indicator
   ============================================================ */

function RaisedHandsIndicator() {
  const { raisedHands } = useModeration();
  const names = Object.values(raisedHands);
  if (names.length === 0) return null;

  return (
    <div className="absolute top-3 left-3 z-10 bg-black/70 text-white text-xs rounded-lg px-3 py-2 max-w-[200px]">
      <div className="font-semibold mb-1">✋ Raised hands ({names.length})</div>
      {names.map((name) => (
        <div key={name} className="truncate">
          {name}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Whiteboard panel
   ============================================================ */

// Full-panel wrapper rendered by LiveStage when whiteboardOpen is true
// (see ModerationProvider above for how that state is broadcast/synced).
// Sits ABOVE the video stage but BELOW BottomBar (z-20) and the
// reconnecting overlay (z-30), so Leave/End/Mic controls and the
// reconnect overlay both remain usable while the board is open — the
// teacher doesn't lose access to session controls just because the
// whiteboard is on screen. The teacher gets an explicit close button
// here too, as a redundant path to toggleWhiteboard beyond the bottom
// bar's own "Close Whiteboard" button.
function WhiteboardPanel({ isModerator, classId, deviceIdentity }) {
  const { toggleWhiteboard } = useModeration();

  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const mainCam = tracks.find(
    (t) =>
      t.participant.identity.startsWith("teacher-") &&
      getDeviceRole(t.participant.identity) === "main"
  );
  useForceQuality(mainCam); // same HIGH-quality corner treatment used elsewhere

  return (
    <div className="absolute inset-0 z-10 bg-white">
      <WhiteboardErrorBoundary>
        <WhiteboardCanvas
          classId={classId}
          role={isModerator ? "TEACHER" : "STUDENT"}
          deviceIdentity={deviceIdentity}
        />
      </WhiteboardErrorBoundary>

      {mainCam && (
        <div className="absolute bottom-4 right-4 w-28 sm:w-40 lg:w-56 aspect-video rounded-lg overflow-hidden border-2 border-white/80 shadow-lg z-10 bg-black">
          <VideoTrack
            trackRef={mainCam}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {isModerator && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWhiteboard();
          }}
          title="Close Whiteboard"
          className="absolute top-3 right-3 z-20 flex items-center justify-center rounded-full lg:rounded-lg bg-black/60 text-white hover:bg-black/80 w-8 h-8 lg:w-auto lg:h-auto lg:px-3 lg:py-2 lg:text-xs"
        >
          <X size={16} className="lg:hidden" />
          <span className="hidden lg:inline">Close Whiteboard</span>
        </button>
      )}
    </div>
  );
}

/* ============================================================
   Student view
   ============================================================ */

function StudentStageView({ isFullscreen, onRequestFullscreen }) {
  const { pinned } = useModeration();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: true,
  });

  const teacherTracks = tracks.filter((t) =>
    t.participant.identity.startsWith("teacher-")
  );

  const screenShare = teacherTracks.find(
    (t) => t.source === Track.Source.ScreenShare
  );
  const mainCam = teacherTracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      getDeviceRole(t.participant.identity) === "main"
  );
  const boardCam = teacherTracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      getDeviceRole(t.participant.identity) === "board"
  );

  let bigTrack = null;
  if (pinned) {
    bigTrack = tracks.find(
      (t) =>
        t.participant.identity === pinned.identity &&
        t.source ===
          (pinned.source === "screen"
            ? Track.Source.ScreenShare
            : Track.Source.Camera)
    );
  }
  if (!bigTrack) bigTrack = screenShare || mainCam || boardCam;

  const dashcam = bigTrack && bigTrack !== mainCam ? mainCam : null;

  // "auto" (the default, and what every student gets until they pick
  // something) preserves the exact original behavior below: bigTrack
  // and boardCam pinned at HIGH unconditionally, mainCam adapting to
  // this student's own connection quality. Picking anything else
  // (High/Medium/Low) is this student explicitly overriding that —
  // most importantly, it's what makes the previously-unconditional
  // "board cam is always HIGH no matter what" stop burning their data
  // once they've said they don't want that.
  const [qualityPref, setQualityPref] = useStudentQualityPreference();
  const manualQuality =
    qualityPref !== "auto" ? QUALITY_LEVELS[qualityPref].quality : null;

  useForceQuality(bigTrack, manualQuality ?? VideoQuality.HIGH);
  useForceQuality(boardCam, manualQuality ?? VideoQuality.HIGH);
  // When a manual level is active, this hook is intentionally disabled
  // (null trackRef -> no-op, see useMainCamAdaptiveQuality) so it can't
  // fight the student's explicit choice; the line below takes over
  // forcing the corner/dashcam view instead.
  useMainCamAdaptiveQuality(manualQuality ? null : mainCam);
  useForceQuality(manualQuality && dashcam ? dashcam : null, manualQuality);
  useFrameQualityMonitoring(bigTrack);

  useEffect(() => {
    if (!bigTrack) return;
    const pub = bigTrack.publication;
    if (!pub) return;

    const logDimensions = () => {
      const dims = pub.dimensions;
      const quality = pub.videoQuality;
      if (dims) {
        console.log(
          "[Student] Track dimensions:",
          dims.width,
          "x",
          dims.height,
          "quality:",
          quality
        );
      }
    };

    logDimensions();
    const interval = setInterval(logDimensions, 2000);
    return () => clearInterval(interval);
  }, [bigTrack]);

  return (
    <div className="relative w-full h-full bg-black">
      {bigTrack ? (
        <VideoTrack
          trackRef={bigTrack}
          className="w-full h-full object-contain"
          style={{
            imageRendering: "auto",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-sm">
          Waiting for teacher to join...
        </div>
      )}

      {dashcam && (
        <div className="absolute bottom-24 right-4 w-28 sm:w-40 aspect-video rounded-lg overflow-hidden border-2 border-white/80 shadow-lg z-10">
          <VideoTrack
            trackRef={dashcam}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Always mounted, visibility toggled via CSS rather than a
          conditional {!isFullscreen && ...} render — see the
          block comment above the isFullscreen state declaration in the
          root component. Mounting/unmounting a DOM node inside the same
          container as the live <video> track on every fullscreen-state
          flip contributed to the black-flash bug on swipe down/up;
          opacity + pointer-events keeps the DOM tree stable instead. */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRequestFullscreen?.();
        }}
        title="Enter fullscreen"
        className={`absolute top-3 right-14 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 transition-opacity duration-200 ${
          isFullscreen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <Expand size={18} />
      </button>

      <QualitySettingsControl quality={qualityPref} onChange={setQualityPref} />

      <RoomAudioRenderer />
    </div>
  );
}

/* ============================================================
   Teacher view
   ============================================================ */

function TeacherStageView() {
  const { pinned, pin, raisedHands } = useModeration();
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: true,
  });

  // Local-only "look closer" zoom — see the block comment above
  // MediaStatusIcons' neighbor section for the full reasoning, but in
  // short: this is a plain React state change, NEVER published over the
  // data channel, and NEVER visible to students. It exists specifically
  // for "student holds a notebook/model up to their camera and the
  // teacher wants to see it big" without turning that into a
  // whole-class broadcast decision (which is what `pin` is for, and
  // stays reserved for the teacher's own devices — see the tile
  // rendering below). Because useManagedSubscriptions already skips
  // subscription-filtering entirely for isModerator, every participant's
  // video is already flowing to the teacher's browser at baseline — so
  // zooming one in costs nothing beyond the state change itself.
  const [focusedParticipant, setFocusedParticipant] = useState(null); // { identity } | null

  // If a broadcast pin starts (teacher pins their own board/main/screen
  // for the whole class), drop any local-only focus so the two
  // full-stage views can never both be "the reason" at once — pin
  // (broadcast) always wins visually since it's the state that also
  // affects students.
  useEffect(() => {
    if (pinned) setFocusedParticipant(null);
  }, [pinned]);

  // If the focused participant leaves the room, fall back to the grid
  // instead of being stuck showing a dead tile.
  useEffect(() => {
    if (!focusedParticipant) return;
    const stillPresent = participants.some(
      (p) => p.identity === focusedParticipant.identity
    );
    if (!stillPresent) setFocusedParticipant(null);
  }, [focusedParticipant, participants]);

  useEffect(() => {
    if (pinned?.source !== "screen") return;
    const stillSharing = tracks.some(
      (t) =>
        t.participant.identity === pinned.identity &&
        t.source === Track.Source.ScreenShare
    );
    if (!stillSharing) pin(null);
  }, [pinned, tracks, pin]);

  const bigTrack = pinned
    ? tracks.find(
        (t) =>
          t.participant.identity === pinned.identity &&
          t.source ===
            (pinned.source === "screen"
              ? Track.Source.ScreenShare
              : Track.Source.Camera)
      )
    : null;

  const mainCam = tracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      t.participant.identity.startsWith("teacher-") &&
      getDeviceRole(t.participant.identity) === "main"
  );
  const cornerTrack =
    pinned && bigTrack && bigTrack !== mainCam ? mainCam : null;

  // Track backing the local-only focus view (camera only — students
  // never screen-share, so there's nothing else to focus on for them).
  const focusedTrack = focusedParticipant
    ? tracks.find(
        (t) =>
          t.participant.identity === focusedParticipant.identity &&
          t.source === Track.Source.Camera
      )
    : null;

  useForceQuality(bigTrack);
  useForceQuality(focusedTrack);
  useFrameQualityMonitoring(bigTrack);

  if (pinned) {
    return (
      <div className="relative w-full h-full bg-black">
        {bigTrack ? (
          <VideoTrack
            trackRef={bigTrack}
            className="w-full h-full object-contain"
            style={{
              imageRendering: "auto",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm">
            Loading pinned view...
          </div>
        )}

        {cornerTrack && (
          <div className="absolute bottom-24 right-4 w-28 sm:w-40 aspect-video rounded-lg overflow-hidden border-2 border-white/80 shadow-lg z-10">
            <VideoTrack
              trackRef={cornerTrack}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            pin(null);
          }}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs rounded-lg px-3 py-2 hover:bg-black/80"
        >
          Back to grid
        </button>

        <RaisedHandsIndicator />
        <RoomAudioRenderer />
      </div>
    );
  }

  // Local-only zoom view — nothing here is broadcast; students' screens
  // are completely unaffected while the teacher is looking at this.
  if (focusedParticipant) {
    return (
      <div className="relative w-full h-full bg-black">
        {focusedTrack ? (
          <VideoTrack
            trackRef={focusedTrack}
            className="w-full h-full object-contain"
            style={{
              imageRendering: "auto",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm">
            Loading video...
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 bg-black/60 text-white/80 text-[11px] rounded-lg px-3 py-1.5">
          Only you can see this zoomed-in view
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFocusedParticipant(null);
          }}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs rounded-lg px-3 py-2 hover:bg-black/80"
        >
          Back to grid
        </button>

        <RaisedHandsIndicator />
        <RoomAudioRenderer />
      </div>
    );
  }

  const screenShareTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare
  );

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 pb-28 overflow-y-auto bg-neutral-900">
        {screenShareTrack && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              pin(screenShareTrack.participant.identity, "screen");
            }}
            className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-400/60 col-span-2"
          >
            <VideoTrack
              trackRef={screenShareTrack}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">
              Screen Share
            </span>
          </button>
        )}

        {participants.map((p) => {
          const camTrack = tracks.find(
            (t) =>
              t.participant.identity === p.identity &&
              t.source === Track.Source.Camera
          );
          const handUp = !!raisedHands[p.identity];
          const isTeacherDevice = p.identity.startsWith("teacher-");

          const tile = (
            <>
              {camTrack ? (
                <VideoTrack
                  trackRef={camTrack}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs bg-neutral-800 px-2 text-center">
                  {p.name || p.identity}
                </div>
              )}

              <span className="absolute bottom-1 left-1 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">
                {p.name || p.identity}
                {isTeacherDevice ? " (you)" : ""}
              </span>

              <MediaStatusIcons participant={p} />

              {handUp && (
                <span className="absolute top-1 right-1 text-sm">✋</span>
              )}
            </>
          );

          if (isTeacherDevice) {
            // Teacher's own devices (main/board) keep the existing
            // BROADCAST pin behavior — clicking these changes what every
            // student sees, same as before this change.
            return (
              <button
                key={p.identity}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  pin(p.identity, "camera");
                }}
                className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-400/60 hover:border-blue-400"
              >
                {tile}
              </button>
            );
          }

          // Student tiles: clicking zooms the tile LOCALLY for the
          // teacher only (see focusedParticipant above) — this never
          // touches the moderation data channel and never changes what
          // any student sees.
          return (
            <button
              key={p.identity}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFocusedParticipant({ identity: p.identity });
              }}
              title="Click to view closer (only visible to you)"
              className={`relative aspect-video rounded-lg overflow-hidden border-2 ${
                handUp ? "border-yellow-400" : "border-white/10"
              } hover:border-white/40`}
            >
              {tile}
            </button>
          );
        })}
        <RoomAudioRenderer />
      </div>
      <RaisedHandsIndicator />
    </div>
  );
}

/* ============================================================
   Reconnecting overlay
   ============================================================ */

function ReconnectingOverlay() {
  return (
    <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-3 text-white">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <div className="text-sm font-medium">Reconnecting...</div>
      <div className="text-xs text-white/60">
        Your connection dropped — trying to get you back in.
      </div>
    </div>
  );
}

/* ============================================================
   Stage
   ============================================================ */

function LiveStage({
  isModerator,
  liveClassId,
  onEnded,
  wsUrl,
  token,
  suppressLeaveNavRef,
  forcedRejoinCancelRef,
  isFullscreen,
  onRequestFullscreen,
}) {
  const layoutContext = useCreateLayoutContext();
  const { visible, toggle } = useAutoHideControls();
  const connectionStatus = useConnectionStatus();
  const { pinned, whiteboardOpen } = useModeration();
  const stableIdentity = useStableLocalIdentity();
  useSharpCameraContentHint(isModerator);
  useManagedSubscriptions(isModerator);
  useTeacherSubscriptionThrottle(isModerator, pinned);
  useAdaptiveQuality(isModerator);
  useBoardCamInitialQuality(isModerator);
  useCameraRecovery(isModerator);
  useMediaStateRecovery(isModerator);
  useBandwidthMonitoring();
  useForcedRejoinFallback(
    wsUrl,
    token,
    suppressLeaveNavRef,
    forcedRejoinCancelRef
  );

  // Bottom bar is hidden while the whiteboard is open, but only for the
  // teacher — WhiteboardPanel's "Close Whiteboard" button is the only
  // control the teacher needs on screen at that point. Students still
  // need their controls (e.g. leave/reactions), so keep it visible for them.
  const showBottomBar = !whiteboardOpen || !isModerator;

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="relative w-full h-full" onClick={toggle}>
        {isModerator ? (
          <TeacherStageView />
        ) : (
          <StudentStageView
            isFullscreen={isFullscreen}
            onRequestFullscreen={onRequestFullscreen}
          />
        )}
        {whiteboardOpen && (
          <WhiteboardPanel
            isModerator={isModerator}
            classId={liveClassId}
            deviceIdentity={stableIdentity}
          />
        )}
        {connectionStatus === "reconnecting" && <ReconnectingOverlay />}
        {showBottomBar && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <BottomBar
              isModerator={isModerator}
              liveClassId={liveClassId}
              onEnded={onEnded}
              forcedRejoinCancelRef={forcedRejoinCancelRef}
            />
          </div>
        )}
      </div>
    </LayoutContextProvider>
  );
}

/* ============================================================
   Room-level options (moved out of individual LiveKitRoom props)
   ============================================================ */

// dynacast / adaptiveStream / videoCaptureDefaults / publishDefaults
// were previously passed as separate top-level props on <LiveKitRoom>.
// @livekit/components-react's <LiveKitRoom> only accepts these inside a
// single `options={{ ...RoomOptions }}` prop — passed directly as their
// own props, they're silently dropped (React just treats them as
// unknown DOM attributes, no warning). Verify this against whatever
// @livekit/components-react version is actually installed before
// shipping — the field names below match the RoomOptions/publish
// defaults shape documented for recent 2.x releases, but I don't have
// this repo's node_modules in front of me in this session to confirm
// against the exact installed version the way the check was described
// in our last exchange.
//
// reconnectPolicy lives here too, since it's also a RoomOptions field,
// not a prop of its own.
class FastEarlyReconnectPolicy {
  constructor(schedule = [0, 150, 400, 800, 1500, 2500, 4000]) {
    this.schedule = schedule;
  }

  // Called by livekit-client with a context object exposing at least
  // `retryCount` (0-indexed attempt number) and `elapsedMs`. Returning a
  // number is the delay (ms) before the next resume/reconnect attempt;
  // returning null tells LiveKit to stop trying on its own.
  //
  // This schedule front-loads much shorter delays than the library
  // default ([0, 300, 1200, 2700, 4800, 7000, 7000...] — ~44s total) so
  // genuine short blips recover fast, and gives up after ~9.3s total
  // rather than ~44s. In practice useForcedRejoinFallback's 5.5s timeout
  // above will usually fire first and force a fresh session before this
  // schedule even exhausts itself — this tuning mainly helps the case
  // where the forced-rejoin hook isn't mounted for some reason, or a
  // resume genuinely succeeds partway through this shorter window.
  nextRetryDelayInMs(context) {
    const { retryCount } = context;
    if (retryCount >= this.schedule.length) return null;
    return this.schedule[retryCount];
  }
}

const ROOM_OPTIONS = {
  dynacast: true,
  adaptiveStream: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  publishDefaults: {
    videoEncoding: {
      maxBitrate: 4_000_000,
      maxFramerate: 30,
    },
    audioPreset: {
      maxBitrate: 32_000,
    },
    red: true,
    simulcast: true,
    videoSimulcastLayers: [
      { ...VideoPresets.h720, scalabilityMode: "L1T3" },
      { ...VideoPresets.h540, scalabilityMode: "L1T3" },
      { ...VideoPresets.h360, scalabilityMode: "L1T3" },
    ],
    degradationPreference: "maintain-resolution",
  },
  reconnectPolicy: new FastEarlyReconnectPolicy(),
};

/* ============================================================
   Root
   ============================================================ */

export default function LiveClassRoom({
  wsUrl,
  token,
  isModerator,
  liveClassId,
}) {
  const navigate = useNavigate();
  const [classEndedMessage, setClassEndedMessage] = useState(false);

  const suppressLeaveNavRef = useRef(false);
  const forcedRejoinCancelRef = useRef(null);

  // Mirrors ModerationProvider's whiteboardOpen state (see the block
  // comment above ModerationProvider's definition for why it can't
  // just live here directly). Used below to suppress the portrait
  // CSS-rotation hack whenever the whiteboard is on screen — see
  // applyPortraitRotationHack near the bottom of this component for
  // why.
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // Whether the document is currently in the Fullscreen API's
  // fullscreen state. Tracked at the root (not inside StudentStageView)
  // because `document.fullscreenElement` is a single global, and this
  // also needs to survive whiteboard open/close and any other stage
  // remounts.
  //
  // IMPORTANT: this is deliberately NOT wired up as its own independent
  // `fullscreenchange` listener with its own immediate setState call.
  // Swiping down for the notification shade (or up for recents) makes
  // Android auto-exit the Fullscreen API state, which fires
  // `fullscreenchange` at the same moment `resize` fires (the status
  // bar reappearing shrinks the viewport). Two separate un-coordinated
  // state updates landing close together on this root component — one
  // rewriting `viewport` (which recomputes the rotated video
  // container's transform in portrait), one flipping `isFullscreen`
  // (which mounts/unmounts the Expand button inside StudentStageView)
  // — is what caused the black-flash-for-1-2s bug after swiping
  // down/up and returning. That bug did NOT exist before fullscreen
  // tracking was added, which is the tell that it's this interaction,
  // not the pre-existing resize handling alone.
  //
  // The fix: `fullscreenchange` feeds into the SAME debounced settle
  // function as resize/orientationchange (see the merged effect
  // below), so a burst of events from one swipe gesture collapses into
  // a single settled re-render that updates viewport AND isFullscreen
  // together, instead of two renders landing back-to-back.
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" && !!document.fullscreenElement
  );

  // Must be called synchronously inside a real click handler — this is
  // what makes Android Chrome (and iOS Safari) honor it, unlike an
  // automatic visibilitychange-triggered attempt elsewhere in this file,
  // which gets silently rejected for lacking a genuine user gesture.
  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    if (screen.orientation?.lock) {
      screen.orientation.lock("landscape").catch(() => {});
    }
  }, []);

  // Only tracks the ORIENTATION CLASS (portrait vs landscape) as a
  // boolean — NOT literal pixel dimensions. The actual sizing math
  // (previously done here by measuring window.innerWidth/innerHeight
  // and feeding those exact pixels into the rotate/translate transform
  // below) has moved entirely to CSS `dvh`/`dvw` units in the JSX,
  // which the browser's own layout engine recalculates continuously as
  // the system status/nav bars come and go — with ZERO React
  // involvement, zero setState, zero re-render.
  //
  // This split matters specifically for the swipe-down/up black-flash
  // bug: a transient system-UI reveal almost never flips portrait vs
  // landscape classification, so `setIsPortrait(portrait)` below is
  // called with the SAME boolean value it already had — and React
  // bails out of re-rendering entirely when a state setter receives a
  // value that's `Object.is`-equal to the current one. So during a
  // typical swipe, this component now does NOT re-render for sizing
  // purposes at all; the browser's CSS engine keeps the rotated
  // container's dvh/dvw-based size correct on its own, the same way a
  // native app's "immersive sticky" system bars overlay the existing
  // frame instead of forcing a relayout. That's the actual mechanism
  // behind why a native fullscreen video player (e.g. YouTube) shows no
  // flicker on this gesture and a JS-pixel-driven transform did.
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== "undefined"
      ? window.innerHeight > window.innerWidth
      : false
  );

  useEffect(() => {
    if (wsUrl) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = wsUrl;
      document.head.appendChild(link);
      return () => document.head.removeChild(link);
    }
  }, [wsUrl]);

  // Swiping down for the notification shade (or up for the
  // recents/shortcut center) while in fullscreen briefly reveals
  // Android's system UI. That single gesture fires BOTH `resize`
  // (viewport shrinks as the status bar reappears) AND
  // `fullscreenchange` (Android auto-exits the Fullscreen API state) —
  // each firing several times in rapid succession as the shade/panel
  // animates open and closed. Handling either one synchronously
  // rewrites this component's state (viewport size + rotated-container
  // transform, or isFullscreen + the Expand button's mount state)
  // multiple times within a fraction of a second. That's layout thrash
  // on the exact element hosting the live <video> track, and Chrome's
  // compositor has to drop and rebuild the video's surface to keep up
  // — which is the black-flash-for-1-2s bug reported after swiping
  // down/up and returning.
  //
  // Fix: both event sources feed into ONE shared debounced "settle"
  // function below, so a whole burst from a single gesture collapses
  // into exactly one re-render — applying the final viewport size AND
  // the final fullscreen state together — once things actually stop
  // moving, instead of firing off separately and repeatedly mid-gesture.
  const settleTimerRef = useRef(null);
  const SETTLE_MS = 150;

  useEffect(() => {
    // Re-requests fullscreen + landscape orientation lock. Broken out
    // as its own function (not just inline in the mount effect) so it
    // can ALSO be called every time the page becomes visible again —
    // most mobile browsers silently drop fullscreen the moment the
    // screen locks or the tab loses visibility, and never restore it on
    // their own. Without re-requesting it here, the browser's own
    // status/address bar chrome comes back permanently after any
    // lock/unlock, which is the white-strip bug in Image 2.
    const enterImmersive = async () => {
      try {
        if (
          document.documentElement.requestFullscreen &&
          !document.fullscreenElement
        ) {
          await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock("landscape");
        }
      } catch {
        // Some browsers only allow requestFullscreen() directly inside
        // a user gesture (tap/click) — a lock/unlock resume is NOT a
        // user gesture, so this can legitimately fail silently on some
        // browsers. That's fine: the viewport-measurement fix below
        // still eliminates the sizing glitch even if fullscreen itself
        // can't be silently re-acquired here.
      }
    };

    // Applies BOTH the current orientation class and the current
    // fullscreen state in one go, as a single batched set of state
    // updates (React batches synchronous setState calls in the same
    // tick into one re-render). This is the "settle" step every
    // debounced handler below ultimately calls. Note this does NOT
    // measure or store pixel dimensions anymore — that's handled by
    // CSS dvh/dvw units directly in the JSX (see the isPortrait state
    // comment above) — it only classifies portrait vs landscape and
    // reads the current fullscreen flag. Calling a setter with the
    // same value it already holds is a no-op re-render in React, which
    // is exactly what happens on most swipe-down/up gestures since
    // they essentially never flip orientation classification.
    const applySettledState = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Shared debounce: resets the timer on every call, so a burst of
    // events from one gesture (swipe down/up, rotation, chrome
    // showing/hiding) only results in ONE applySettledState() call,
    // once things stop firing for SETTLE_MS.
    const scheduleSettle = () => {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(applySettledState, SETTLE_MS);
    };

    // Runs on every genuine size change (rotation, browser chrome
    // showing/hiding, etc) — debounced via scheduleSettle above.
    const handleResize = () => {
      scheduleSettle();
    };

    // Android auto-exits the Fullscreen API state on the same swipe
    // gesture that triggers the resize above — routed through the same
    // debounce so both land in the same settled re-render rather than
    // firing their own separate one.
    const handleFullscreenChange = () => {
      scheduleSettle();
    };

    // Runs specifically when returning from a backgrounded/locked
    // state — applySettledState() alone isn't enough here since resize/
    // orientationchange/fullscreenchange don't reliably fire just from
    // a screen lock/unlock cycle on every mobile browser, but
    // visibilitychange always does. Also re-attempts fullscreen/
    // orientation lock, since that's the other half of what a
    // lock/unlock cycle silently undoes. Not debounced — a genuine
    // background/foreground transition is a one-shot event, not a
    // burst, so there's nothing to coalesce and we want the correct
    // size/fullscreen state applied as promptly as possible here.
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      applySettledState();
      if (isPortrait) enterImmersive();
    };

    applySettledState();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (isPortrait) {
      enterImmersive();
    }

    return () => {
      clearTimeout(settleTimerRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPortrait]);

  const handleClassEnded = useCallback(() => {
    setClassEndedMessage(true);
    setTimeout(() => navigate(-1), 2000);
  }, [navigate]);

  const handleLeave = useCallback(() => {
    if (suppressLeaveNavRef.current) return;
    navigate(-1);
  }, [navigate]);

  if (classEndedMessage) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-lg font-semibold">Class has ended</div>
      </div>
    );
  }

  // Only apply the CSS "fake landscape" rotation trick while the
  // whiteboard is CLOSED. <Excalidraw>'s own pointer-position math
  // (clientX/clientY relative to its container's getBoundingClientRect)
  // has no notion of a rotated ancestor — a translate/scale wrapper
  // would be transparent to it, but a 90° rotation swaps/flips the
  // local X/Y axes, which is exactly what produced the cursor/ink
  // offset gap on the board, worst in fullscreen since that's the only
  // time this rotate transform is ever applied. AspectRatioStage
  // already adapts its box to whatever shape the container actually
  // is, so rendering the board in true (unrotated) portrait here is
  // safe — it just means the device visually reverts to portrait for
  // as long as the whiteboard stays open, then re-locks to the rotated
  // "fake landscape" view when it's closed again.
  const applyPortraitRotationHack = isPortrait && !whiteboardOpen;

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={
        applyPortraitRotationHack
          ? {
              // `dvh`/`dvw` instead of static "100vh"/"100vw" OR
              // JS-measured pixel values — see the isPortrait state
              // comment above for why this matters. Regular "100vh" can
              // briefly reflect a stale, fullscreen-hidden-chrome size
              // on mobile; dvh/dvw are defined specifically to track
              // the browser's actual current visual viewport, and the
              // browser recalculates them on its own as chrome
              // shows/hides — no JS measurement, no setState, no
              // re-render needed to keep this correct.
              width: "100lvh",
              height: "100lvw",
              transform: "rotate(90deg) translateY(-100%)",
              transformOrigin: "top left",
            }
          : { width: "100lvw", height: "100lvh" }
      }
    >
      <LiveKitRoom
        serverUrl={wsUrl}
        token={token}
        connect={true}
        video={false}
        audio={false}
        options={ROOM_OPTIONS}
        onDisconnected={handleLeave}
        data-lk-theme="default"
        style={{ height: "100%", width: "100%" }}
      >
        <ModerationProvider
          isModerator={isModerator}
          onClassEnded={handleClassEnded}
          onWhiteboardOpenChange={setWhiteboardOpen}
        >
          <LiveStage
            isModerator={isModerator}
            liveClassId={liveClassId}
            onEnded={handleLeave}
            wsUrl={wsUrl}
            token={token}
            suppressLeaveNavRef={suppressLeaveNavRef}
            forcedRejoinCancelRef={forcedRejoinCancelRef}
            isFullscreen={isFullscreen}
            onRequestFullscreen={requestFullscreen}
          />
        </ModerationProvider>
      </LiveKitRoom>
    </div>
  );
}