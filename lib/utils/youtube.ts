/** YouTube havolasini (watch/youtu.be) `embed` URL'ga aylantiradi. */
export function youtubeEmbedUrl(havola: string): string | null {
  try {
    const url = new URL(havola);
    let videoId: string | null = null;

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v");
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
