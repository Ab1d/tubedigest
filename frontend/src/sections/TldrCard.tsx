interface TldrCardProps {
  content: string;
  videoId?: string;
}

import { renderTextWithTimestamps } from '@/components/renderTimestamps';

export default function TldrCard({ content, videoId }: TldrCardProps) {
  return (
    <section className="relative pl-5 md:pl-6 border-l-2 border-burgundy/30 dark:border-burgundy/40">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          TL;DR
        </span>
      </div>
      <p className="font-display text-[26px] md:text-[34px] lg:text-[40px] font-medium text-charcoal dark:text-white leading-[1.25] tracking-tight transition-colors duration-500">
        {videoId ? renderTextWithTimestamps(content, videoId) : content}
      </p>
    </section>
  );
}
