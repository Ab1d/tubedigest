import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingSectionProps {
  onComplete: () => void;
  statusMessage?: string;
  videoTitle?: string;
}

const LOADING_STEPS = [
  'Fetching video metadata',
  'Reading transcript',
  'Generating summary',
  'Creating analogies',
  'Finalizing',
];

export default function LoadingSection({ onComplete, statusMessage, videoTitle }: LoadingSectionProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalTime = 3000;
    const interval = 30;
    const steps = totalTime / interval;
    let count = 0;

    const timer = setInterval(() => {
      count++;
      const newProgress = Math.min((count / steps) * 100, 100);
      setProgress(newProgress);

      const stepIndex = Math.min(
        Math.floor((newProgress / 100) * LOADING_STEPS.length),
        LOADING_STEPS.length - 1
      );
      setActiveStepIndex(stepIndex);

      if (count >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  const displayStatus = statusMessage || LOADING_STEPS[activeStepIndex];

  return (
    <section className="min-h-[100dvh] flex items-center justify-center bg-parchment dark:bg-charcoal-dark px-6 transition-colors duration-500">
      <motion.div
        className="max-w-[640px] mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <img src="/logo.svg" alt="TubeDigest" className="w-[140px] mx-auto mb-10 opacity-60 dark:invert" />

        {/* Minimal dot loader */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <motion.span
            className="w-2 h-2 rounded-full bg-burgundy"
            animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-burgundy"
            animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-burgundy"
            animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </div>

        {/* Video title — the hero element */}
        <h1 className="font-display text-3xl md:text-[42px] font-medium text-charcoal dark:text-white leading-[1.2] tracking-tight transition-colors duration-500">
          {videoTitle || 'Analyzing Video...'}
        </h1>

        {/* Live status from backend */}
        <div className="mt-6 h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayStatus}
              className="text-sm text-charcoal/50 dark:text-grey-medium font-body transition-colors duration-500"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayStatus}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Minimal progress bar */}
        <div className="mt-10 max-w-[280px] mx-auto">
          <div className="h-[2px] bg-charcoal/10 dark:bg-charcoal-light rounded-full overflow-hidden transition-colors duration-500">
            <motion.div
              className="h-full bg-burgundy"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
