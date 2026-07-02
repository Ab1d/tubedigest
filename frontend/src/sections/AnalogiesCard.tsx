import type { AnalogyItem } from '@/services/mockAIService';

interface AnalogiesCardProps {
  analogies: AnalogyItem[];
}

export default function AnalogiesCard({ analogies }: AnalogiesCardProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Analogies & Visuals
        </span>
      </div>
      <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] mb-8 transition-colors duration-500">
        Made Easy to Understand
      </h2>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analogies.map((analogy, index) => (
          <div
            key={index}
            className="rounded-xl border border-charcoal/8 dark:border-white/8 bg-grey-light/30 dark:bg-white/[0.02] p-6 md:p-7 transition-colors duration-500"
          >
            <span className="text-[11px] font-semibold text-burgundy uppercase tracking-[0.12em]">
              {analogy.concept}
            </span>
            <p className="text-[17px] text-charcoal/80 dark:text-grey-medium leading-[1.7] mt-3 transition-colors duration-500">
              {analogy.analogy}
            </p>
            {analogy.visual && (
              <p className="text-sm text-charcoal/40 dark:text-grey-medium/60 italic mt-4 leading-[1.6] border-t border-charcoal/5 dark:border-white/5 pt-4 transition-colors duration-500">
                Visual: {analogy.visual}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
