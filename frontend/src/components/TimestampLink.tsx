import { Clock } from 'lucide-react';

interface TimestampLinkProps {
  timestamp: string;
  videoId: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Parse a timestamp string (e.g. "2:34" or "1:23:45") into total seconds
 */
export function parseTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Regex to match timestamps in text: [MM:SS] or [H:MM:SS]
 */
export const TIMESTAMP_REGEX = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;

/**
 * Build a YouTube watch URL with timestamp
 */
export function buildYouTubeTimestampUrl(videoId: string, timestamp: string): string {
  const seconds = parseTimestampToSeconds(timestamp);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

export default function TimestampLink({ timestamp, videoId, className = '', showIcon = true }: TimestampLinkProps) {
  const url = buildYouTubeTimestampUrl(videoId, timestamp);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-1
        px-1.5 py-0.5 rounded-md
        text-[13px] font-medium
        bg-burgundy/10 text-burgundy
        hover:bg-burgundy/20
        transition-colors duration-200
        ${className}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {showIcon && <Clock size={11} strokeWidth={2} />}
      {timestamp}
    </a>
  );
}
