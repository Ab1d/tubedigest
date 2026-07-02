import TimestampLink, { TIMESTAMP_REGEX } from './TimestampLink';

/**
 * Split text by timestamp patterns like [MM:SS] and render them as
 * clickable TimestampLink components alongside regular text.
 */
export function renderTextWithTimestamps(text: string, videoId: string): React.ReactNode[] {
  if (!videoId || !text) return [text];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  TIMESTAMP_REGEX.lastIndex = 0;

  while ((match = TIMESTAMP_REGEX.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = TIMESTAMP_REGEX.lastIndex;
    const timestamp = match[1];

    // Add text before the timestamp
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    // Add the timestamp link
    parts.push(
      <TimestampLink
        key={`${matchStart}-${timestamp}`}
        timestamp={timestamp}
        videoId={videoId}
        showIcon={false}
        className="mx-0.5 align-text-bottom"
      />
    );

    lastIndex = matchEnd;
  }

  // Add remaining text after last timestamp
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Pre-process markdown text to replace [MM:SS] timestamps with actual markdown links
 * so ReactMarkdown can render them as clickable links.
 */
export function injectTimestampLinksInMarkdown(text: string, videoId: string): string {
  if (!videoId || !text) return text;

  return text.replace(TIMESTAMP_REGEX, (_match, timestamp) => {
    const seconds = timestamp
      .split(':')
      .map(Number)
      .reduce((acc: number, val: number) => {
        return acc * 60 + val;
      }, 0);
    const url = `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
    return `[${timestamp}](${url})`;
  });
}
