import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HistoryDrawer from '@/components/HistoryDrawer';
import ProviderSettings from '@/components/ProviderSettings';
import Layout from '@/components/Layout';
import HeroSection from '@/sections/HeroSection';
import LoadingSection from '@/sections/LoadingSection';
import SummaryView from '@/sections/SummaryView';
import type { SummaryData } from '@/services/localAIService';
import {
  summarizeVideo,
  fetchYouTubeMetadata,
  fetchHistory,
  clearHistory,
  deleteHistoryItem,
  validateYouTubeUrl,
} from '@/services/localAIService';
import { loadActiveProvider, BUILT_IN_PROVIDERS } from '@/services/aiProviderService';

type AppState = 'hero' | 'loading' | 'summary';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('hero');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<SummaryData[]>([]);
  const [activeProviderLabel, setActiveProviderLabel] = useState<string | null>(null);

  // Load history from backend on mount
  useEffect(() => {
    fetchHistory().then((data) => {
      if (data.length > 0) setHistory(data);
    });
  }, []);

  // Derive active provider label for UI
  const refreshProviderLabel = useCallback(() => {
    const active = loadActiveProvider();
    if (active) {
      const provider = BUILT_IN_PROVIDERS.find((p) => p.id === active.provider);
      setActiveProviderLabel(provider ? `${provider.name} · ${active.model}` : active.model);
    } else {
      setActiveProviderLabel(null);
    }
  }, []);

  useEffect(() => {
    refreshProviderLabel();
  }, [refreshProviderLabel]);
  const [loadingStep, setLoadingStep] = useState("Analyzing...");
  const [videoTitle, setVideoTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-summarize if ?url= query param is present (Chrome extension flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam && validateYouTubeUrl(urlParam)) {
      // Small delay so the hero section animates in first
      const timer = setTimeout(() => {
        handleSubmit(urlParam);
        // Clean up query param without reload
        window.history.replaceState({}, '', window.location.pathname);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = useCallback(async (url: string) => {
    setError(null);
    setAppState('loading');
    setLoadingStep("Initializing...");
    setVideoTitle('');

    // Fetch title early so it shows during loading
    const meta = await fetchYouTubeMetadata(url);
    if (meta?.title) setVideoTitle(meta.title);

    try {
      let summary = await summarizeVideo(url, (step) => {
        setLoadingStep(step);
      });

      if (meta?.title) {
        summary = { ...summary, videoTitle: meta.title, channelName: meta.author || summary.channelName };
      }

      setSummaryData(summary);
      setHistory((prev) => [summary, ...prev.filter((h) => h.videoUrl !== url)]);
      setAppState('summary');
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setAppState('hero');
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    // Handled by the async flow in handleSubmit
  }, []);

  const handleSummarizeAnother = useCallback(() => {
    setAppState('hero');
    setSummaryData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!summaryData) return;
    const url = summaryData.videoUrl;
    setIsRefreshing(true);
    setError(null);

    try {
      let summary = await summarizeVideo(url, (step) => {
        setLoadingStep(step);
      });

      const meta = await fetchYouTubeMetadata(url);
      if (meta?.title) {
        summary = { ...summary, videoTitle: meta.title, channelName: meta.author || summary.channelName };
      }

      setSummaryData(summary);
      setHistory((prev) => [summary, ...prev.filter((h) => h.videoUrl !== url)]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Refresh failed';
      setError(msg);
    } finally {
      setIsRefreshing(false);
    }
  }, [summaryData]);

  const handleSelectHistoryItem = useCallback((item: SummaryData) => {
    setSummaryData(item);
    setAppState('summary');
  }, []);

  const handleClearHistory = useCallback(async () => {
    const ok = await clearHistory();
    if (ok) setHistory([]);
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    const ok = await deleteHistoryItem(id);
    if (ok) setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return (
    <Layout>
      <Navbar
        onHistoryClick={() => setHistoryDrawerOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        transparent={appState === 'hero' || appState === 'loading'}
      />

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-16 left-0 right-0 z-40 bg-charcoal border-b border-white/10 px-4 py-3"
          >
            <div className="mx-auto max-w-[900px] flex items-center gap-3">
              <p className="text-grey-medium text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-grey-medium hover:text-white text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        {appState === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection onSubmit={handleSubmit} activeProviderLabel={activeProviderLabel} />
          </motion.div>
        )}

        {appState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSection
              onComplete={handleLoadingComplete}
              statusMessage={loadingStep}
              videoTitle={videoTitle}
            />
          </motion.div>
        )}

        {appState === 'summary' && summaryData && (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SummaryView
              data={summaryData}
              onSummarizeAnother={handleSummarizeAnother}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        history={history}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteItem}
        onClearAll={handleClearHistory}
      />

      {/* Provider Settings */}
      <ProviderSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onProviderChange={refreshProviderLabel}
      />
    </Layout>
  );
}
