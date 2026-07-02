import { renderTextWithTimestamps } from '@/components/renderTimestamps';

interface SimpleSummaryCardProps {
  paragraphs: string[];
  videoId?: string;
}

export default function SimpleSummaryCard({ paragraphs, videoId }: SimpleSummaryCardProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Simple Summary
        </span>
      </div>
      <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] mb-8 transition-colors duration-500">
        In Simple Terms
      </h2>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />
      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-[17px] text-charcoal/75 dark:text-grey-medium leading-[1.8] transition-colors duration-500"
          >
            {videoId ? renderTextWithTimestamps(paragraph, videoId) : paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
