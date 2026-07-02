import type { SectionItem } from '@/services/mockAIService';
import TimestampLink from '@/components/TimestampLink';

interface SectionsCardProps {
  sections: SectionItem[];
  videoId?: string;
}

export default function SectionsCard({ sections, videoId }: SectionsCardProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Breakdown
        </span>
      </div>
      <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] mb-8 transition-colors duration-500">
        {sections.length} Key {sections.length === 1 ? 'Point' : 'Points'}
      </h2>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section.number}
            className="group flex gap-4 rounded-xl border border-charcoal/8 dark:border-white/8 bg-grey-light/30 dark:bg-white/[0.02] p-5 md:p-6 transition-colors duration-500 hover:border-burgundy/20"
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center text-sm font-semibold transition-colors duration-500">
              {section.number}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-[15px] font-semibold text-charcoal dark:text-white leading-snug transition-colors duration-500">
                  {section.title}
                </h3>
                {videoId && section.timestamp && (
                  <TimestampLink timestamp={section.timestamp} videoId={videoId} showIcon />
                )}
              </div>
              <p className="text-[15px] text-charcoal/70 dark:text-grey-medium leading-[1.7] transition-colors duration-500">
                {section.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
