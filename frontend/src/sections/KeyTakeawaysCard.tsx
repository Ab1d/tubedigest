import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { renderTextWithTimestamps } from '@/components/renderTimestamps';

interface KeyTakeawaysCardProps {
  takeaways: string[];
  videoId?: string;
}

export default function KeyTakeawaysCard({ takeaways, videoId }: KeyTakeawaysCardProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const fullText = takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleShare = async () => {
    const text = `Key Takeaways:\n\n${fullText}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TubeDigest Summary', text });
        return;
      } catch {
        // User cancelled or not supported
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <section className="lg:sticky lg:top-24">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Key Takeaways
        </span>
      </div>
      <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] mb-8 transition-colors duration-500">
        What to Remember
      </h2>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />
      <div className="space-y-5">
        {takeaways.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full border border-charcoal/15 dark:border-white/10 text-charcoal/50 dark:text-grey-medium flex items-center justify-center text-[13px] font-medium mt-0.5 transition-colors duration-500">
              {index + 1}
            </span>
            <p className="flex-1 text-[15px] text-charcoal/75 dark:text-grey-medium leading-[1.65] pt-0.5 transition-colors duration-500">
              {videoId ? renderTextWithTimestamps(item, videoId) : item}
            </p>
          </div>
        ))}
      </div>

      <div className="h-px bg-charcoal/10 dark:bg-white/5 my-8 transition-colors duration-500" />
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 dark:border-white/10 px-4 py-2 text-sm text-charcoal/60 dark:text-grey-medium hover:text-charcoal dark:hover:text-white hover:border-charcoal/20 dark:hover:border-white/20 transition-colors"
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          onClick={handleCopyAll}
          className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 dark:border-white/10 px-4 py-2 text-sm text-charcoal/60 dark:text-grey-medium hover:text-charcoal dark:hover:text-white hover:border-charcoal/20 dark:hover:border-white/20 transition-colors"
        >
          {copiedAll ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy All
            </>
          )}
        </button>
      </div>
    </section>
  );
}
