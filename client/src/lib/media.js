export function getMediaUrl(material) {
  for (const candidate of [material?.fileUrl, material?.videoUrl, material?.youtubeUrl]) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;

    try {
      const url = new URL(candidate.trim());
      if (["http:", "https:"].includes(url.protocol)) return url.href;
    } catch {
      // Continue to another stored URL field if this one is malformed.
    }
  }

  return null;
}

export function getMediaActionLabel(material) {
  if (material?.type === "RECORDED_LECTURE") return "Watch video";
  if (["PRESENTATION", "STUDY_MATERIAL"].includes(material?.type)) return "Open document";
  return "Open material";
}

export function getYouTubeVideoId(material) {
  const storedId = material?.youtubeVideoId;
  if (typeof storedId === "string" && /^[\w-]{11}$/.test(storedId)) return storedId;

  for (const candidate of [material?.youtubeUrl, material?.videoUrl]) {
    if (typeof candidate !== "string") continue;

    try {
      const url = new URL(candidate);
      let videoId = null;
      if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
        videoId = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      } else if (url.hostname === "youtu.be") {
        videoId = url.pathname.slice(1).split("/")[0];
      }
      if (videoId && /^[\w-]{11}$/.test(videoId)) return videoId;
    } catch {
      // Ignore malformed fields and check the next one.
    }
  }

  return null;
}
