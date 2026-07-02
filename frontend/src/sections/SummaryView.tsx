import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, FileDown } from 'lucide-react';
import type { SummaryData } from '@/services/mockAIService';
import VideoInfoBar from '@/components/VideoInfoBar';
import Footer from '@/components/Footer';
import TldrCard from './TldrCard';
import SimpleSummaryCard from './SimpleSummaryCard';
import DeepSummaryCard from './DeepSummaryCard';
import AnalogiesCard from './AnalogiesCard';
import KeyTakeawaysCard from './KeyTakeawaysCard';
import ChatSection from './ChatSection';
import SectionsCard from './SectionsCard';

interface SummaryViewProps {
  data: SummaryData;
  onSummarizeAnother: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function SummaryView({ data, onSummarizeAnother, onRefresh, isRefreshing }: SummaryViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExportObsidian = () => {
    const safe = (str: string) => str.replace(/"/g, '\\"');

    const sectionsMd = data.summary.sections.length
      ? data.summary.sections
          .map((s) => `${s.number}. **${s.title}** — ${s.summary}`)
          .join('\n')
      : 'None';

    const analogiesMd = data.summary.analogies.length
      ? data.summary.analogies
          .map(
            (a) =>
              `**${a.concept}**\n\n${a.analogy}${a.visual ? `\n\n*Visual: ${a.visual}*` : ''}`
          )
          .join('\n\n---\n\n')
      : 'None';

    const md = `---
source: "${safe(data.videoUrl)}"
title: "${safe(data.videoTitle)}"
channel: "${safe(data.channelName)}"
duration: "${safe(data.duration)}"
date: "${data.createdAt}"
---

# ${data.videoTitle}

> **TL;DR**
> ${data.summary.tldr}

## Simple Summary

${data.summary.simpleSummary.join('\n\n')}

## Detailed Analysis

${data.summary.deepSummary.join('\n\n')}

${data.summary.sections.length ? `## Key Points\n\n${sectionsMd}\n\n` : ''}## Analogies

${analogiesMd}

## Key Takeaways

${data.summary.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = data.videoTitle.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 50);
    a.href = url;
    a.download = `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-charcoal-dark transition-colors duration-500">
      <main className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-16 md:py-24">
        {/* Video Info + Refresh */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <VideoInfoBar
                title={data.videoTitle}
                channelName={data.channelName}
                duration={data.duration}
                thumbnailUrl={data.thumbnailUrl}
                videoUrl={data.videoUrl}
              />
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 dark:border-white/10 px-4 py-2.5 text-sm text-charcoal/60 dark:text-grey-medium hover:text-charcoal dark:hover:text-white hover:border-charcoal/20 dark:hover:border-white/20 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-charcoal/10 dark:bg-white/5 my-12 md:my-16 transition-colors duration-500" />

        {/* TL;DR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TldrCard content={data.summary.tldr} videoId={data.videoId} />
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-charcoal/10 dark:bg-white/5 my-12 md:my-16 transition-colors duration-500" />

        {/* Sections Breakdown */}
        {data.summary.sections && data.summary.sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <SectionsCard sections={data.summary.sections} videoId={data.videoId} />
          </motion.div>
        )}

        {data.summary.sections && data.summary.sections.length > 0 && (
          <div className="h-px bg-charcoal/10 dark:bg-white/5 my-12 md:my-16 transition-colors duration-500" />
        )}

        {/* Two-column grid: Simple Summary + Key Takeaways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SimpleSummaryCard paragraphs={data.summary.simpleSummary} videoId={data.videoId} />
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <KeyTakeawaysCard takeaways={data.summary.keyTakeaways} videoId={data.videoId} />
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-charcoal/10 dark:bg-white/5 my-12 md:my-16 transition-colors duration-500" />

        {/* Deep Summary — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <DeepSummaryCard paragraphs={data.summary.deepSummary} />
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-charcoal/10 dark:bg-white/5 my-12 md:my-16 transition-colors duration-500" />

        {/* Analogies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <AnalogiesCard analogies={data.summary.analogies} />
        </motion.div>

        {/* Chat / Q&A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ChatSection
            videoUrl={data.videoUrl}
            summary={data.summary}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-20 md:mt-24 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <button
            onClick={handleExportObsidian}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 dark:border-white/10 px-8 py-3.5 text-sm font-medium text-charcoal/70 dark:text-grey-medium hover:text-charcoal dark:hover:text-white hover:border-charcoal/20 dark:hover:border-white/20 transition-colors duration-200"
          >
            <FileDown size={14} strokeWidth={2} />
            Export to Obsidian
          </button>
          <button
            onClick={onSummarizeAnother}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal px-8 py-3.5 text-sm font-medium hover:bg-charcoal/85 dark:hover:bg-grey-warm transition-colors duration-200"
          >
            Summarize Another Video
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
