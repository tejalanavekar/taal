export function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
