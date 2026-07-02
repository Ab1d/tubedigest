import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { injectTimestampLinksInMarkdown } from '@/components/renderTimestamps';

interface DeepSummaryCardProps {
  paragraphs: string[];
  videoId?: string;
}

const markdownComponents = () => ({
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="font-display text-xl md:text-2xl font-semibold text-charcoal dark:text-white mb-3 tracking-tight transition-colors duration-500">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="font-display text-lg md:text-xl font-semibold text-charcoal dark:text-white mb-3 tracking-tight transition-colors duration-500">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-display text-base md:text-[17px] font-semibold text-charcoal dark:text-white mb-2.5 tracking-tight transition-colors duration-500">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-[15px] font-semibold text-charcoal dark:text-white mb-2 tracking-tight transition-colors duration-500">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[17px] text-charcoal/75 dark:text-grey-medium leading-[1.8] mb-4 last:mb-0 transition-colors duration-500">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-charcoal dark:text-white transition-colors duration-500">
      {children}
    </strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-charcoal/80 dark:text-grey-medium/90 transition-colors duration-500">
      {children}
    </em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-4 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-4 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[17px] text-charcoal/75 dark:text-grey-medium leading-[1.7] transition-colors duration-500">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-burgundy/30 pl-4 italic text-charcoal/60 dark:text-grey-medium/80 mb-4 transition-colors duration-500">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isYouTube = href?.includes('youtube.com/watch');
    return (
      <a
        href={href}
        target={isYouTube ? '_blank' : undefined}
        rel={isYouTube ? 'noopener noreferrer' : undefined}
        className={`transition-colors ${isYouTube ? 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[13px] font-medium bg-burgundy/10 text-burgundy hover:bg-burgundy/20 align-text-bottom mx-0.5' : 'text-burgundy hover:underline'}`}
      >
        {children}
      </a>
    );
  },
});

export default function DeepSummaryCard({ paragraphs, videoId }: DeepSummaryCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Deep Summary
        </span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] transition-colors duration-500">
          Detailed Analysis
        </h2>
        {paragraphs.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-sm text-charcoal/50 dark:text-grey-medium hover:text-charcoal dark:hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Show More
              </>
            )}
          </button>
        )}
      </div>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 overflow-hidden',
          !expanded && 'max-h-[500px] relative'
        )}
      >
        {paragraphs.map((paragraph, index) => {
          const processed = videoId ? injectTimestampLinksInMarkdown(paragraph, videoId) : paragraph;
          return (
            <div key={index}>
              <ReactMarkdown components={markdownComponents()}>
                {processed}
              </ReactMarkdown>
            </div>
          );
        })}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-charcoal-dark to-transparent transition-colors duration-500" />
        )}
      </div>
    </section>
  );
}
