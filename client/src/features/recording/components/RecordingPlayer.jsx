import { useEffect, useRef, useState } from "react";

let youtubeApiPromise = null;

function loadYouTubeAPI() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API failed to initialize."));
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");

      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;

      script.onerror = () => {
        youtubeApiPromise = null;
        reject(new Error("Failed to load YouTube IFrame API."));
      };

      document.body.appendChild(script);
    } else if (window.YT?.Player) {
      resolve(window.YT);
    }
  });

  return youtubeApiPromise;
}

export default function RecordingPlayer({ videoId, title }) {
  const containerRef = useRef(null);
  const playerMountRef = useRef(null); // permanent — React never unmounts this
  const playerRef = useRef(null);
  const wasFullscreenRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  // Create the YT player when "started" becomes true
  useEffect(() => {
    if (!started) return;

    let cancelled = false;

    async function initPlayer() {
      try {
        const YT = await loadYouTubeAPI();

        if (cancelled || !playerMountRef.current) return;

        playerRef.current = new YT.Player(playerMountRef.current, {
          videoId,

          width: "100%",
          height: "100%",

          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 0,
            origin: window.location.origin,
          },

          events: {
            onReady: () => {
              if (cancelled) return;
              setReady(true);
            },
          },
        });
      } catch (error) {
        console.error("[RecordingPlayer] Failed to initialize:", error);
      }
    }

    initPlayer();

    return () => {
      cancelled = true;
    };
  }, [started, videoId]);

  // Tear the player down when "started" goes back to false —
  // imperative destroy, never a React unmount of the DOM node.
  function destroyPlayer() {
    if (playerRef.current?.destroy) {
      try {
        playerRef.current.destroy();
      } catch {
        // Iframe may already be gone — safe to ignore.
      }
    }

    playerRef.current = null;

    // YT.Player replaced our mount div with an iframe; rebuild a fresh
    // empty div in its place so the next play click has something to mount into.
    if (playerMountRef.current?.parentElement) {
      const fresh = document.createElement("div");
      fresh.style.width = "100%";
      fresh.style.height = "100%";

      playerMountRef.current.parentElement.replaceChild(
        fresh,
        playerMountRef.current
      );

      playerMountRef.current = fresh;
    }

    setReady(false);
  }

  useEffect(() => {
    async function handleFullscreenChange() {
      const fullscreen = Boolean(document.fullscreenElement);

      if (fullscreen) {
        wasFullscreenRef.current = true;

        if (screen.orientation?.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch {
            // Orientation lock unsupported (e.g. iOS Safari) — fullscreen still works.
          }
        }
      } else {
        if (screen.orientation?.unlock) {
          screen.orientation.unlock();
        }

        if (wasFullscreenRef.current) {
          wasFullscreenRef.current = false;
          destroyPlayer();
          setStarted(false);
        }
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  async function handlePlay() {
    setStarted(true);

    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Fullscreen denied or unsupported — playback continues inline.
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-xl bg-black shadow-xl"
    >
      {/* Always in the DOM — React never removes this node.
          YouTube's iframe gets swapped in/out inside it imperatively. */}
      <div ref={playerMountRef} className="absolute inset-0 w-full h-full" />

      {started && !ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/70">Loading recording...</span>
          </div>
        </div>
      )}

      {!started && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 w-full h-full group"
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title || "Recording thumbnail"}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-105 transition">
              <span className="text-2xl ml-1">▶</span>
            </div>
          </div>

          {title && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent text-left">
              <span className="text-white text-sm font-medium truncate block">
                {title}
              </span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}