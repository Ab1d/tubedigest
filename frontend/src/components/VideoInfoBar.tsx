import { ExternalLink } from 'lucide-react';

interface VideoInfoBarProps {
  title: string;
  channelName: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export default function VideoInfoBar({
  title,
  channelName,
  duration,
  thumbnailUrl,
  videoUrl,
}: VideoInfoBarProps) {
  return (
    <div className="flex items-start gap-6">
      <div className="hidden sm:block flex-shrink-0">
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-[84px] w-[150px] rounded-lg object-cover shadow-sm"
        />
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <h1 className="text-charcoal dark:text-white text-xl md:text-[22px] font-medium leading-snug transition-colors duration-500">
          {title}
        </h1>
        <p className="text-charcoal/50 dark:text-grey-medium text-sm mt-2 transition-colors duration-500">
          {channelName} &middot; {duration}
        </p>
      </div>

      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal px-5 py-2.5 text-sm font-medium hover:bg-charcoal/85 dark:hover:bg-grey-warm transition-colors duration-200"
      >
        <ExternalLink size={14} />
        <span className="hidden sm:inline">Watch</span>
      </a>
    </div>
  );
}
