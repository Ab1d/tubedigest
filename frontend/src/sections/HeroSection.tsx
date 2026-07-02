import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateYouTubeUrl } from "@/services/mockAIService";

interface HeroSectionProps {
  onSubmit: (url: string) => void;
  activeProviderLabel?: string | null;
}

export default function HeroSection({
  onSubmit,
  activeProviderLabel,
}: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!validateYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setError("");
    onSubmit(url);
  }, [url, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center bg-parchment dark:bg-charcoal-dark px-6 transition-colors duration-500">
      <div className="relative z-10 mx-auto w-full max-w-[720px] text-center">
        {/* Label */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-burgundy" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium">
            YouTube Video Summarizer
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display text-[42px] sm:text-[52px] md:text-[64px] font-medium text-charcoal dark:text-white leading-[1.1] tracking-tight transition-colors duration-500"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Understand any video
          <br />
          in minutes.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-base md:text-lg text-charcoal/60 dark:text-grey-medium leading-relaxed max-w-[480px] mx-auto transition-colors duration-500"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Paste a link. Get a structured summary
        </motion.p>

        {/* Input */}
        <motion.div
          className="mt-12 max-w-[560px] mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          {activeProviderLabel && (
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-burgundy" />
              <span className="text-[11px] font-medium text-charcoal/50 dark:text-grey-medium uppercase tracking-wider">
                Powered by {activeProviderLabel}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative flex-column gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Paste a YouTube URL..."
                className={cn(
                  "w-full bg-transparent border-b py-3 pr-4 text-base text-charcoal dark:text-white placeholder:text-charcoal/40 dark:placeholder:text-grey-medium/60 focus:outline-none transition-colors duration-300",
                  error
                    ? "border-burgundyRed"
                    : isFocused
                      ? "border-burgundy"
                      : "border-charcoal/15 dark:border-grey-warm/25 hover:border-charcoal/30 dark:hover:border-grey-warm/50",
                )}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-3 text-sm font-medium hover:bg-charcoal/85 dark:hover:bg-grey-warm transition-colors duration-200"
            >
              Summarize
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              className="text-left mt-3 text-sm text-burgundyRed/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
