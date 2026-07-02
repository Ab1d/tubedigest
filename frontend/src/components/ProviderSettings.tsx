import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Check, AlertCircle, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import {
  BUILT_IN_PROVIDERS,
  loadActiveProvider,
  saveActiveProvider,
  validateProviderWithBackend,
  type ProviderConfig,
} from '@/services/aiProviderService';
import { cn } from '@/lib/utils';

interface ProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChange?: () => void;
}

export default function ProviderSettings({ isOpen, onClose, onProviderChange }: ProviderSettingsProps) {
  const [providers] = useState<ProviderConfig[]>(BUILT_IN_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeProvider = providers.find((p) => p.id === selectedProvider);

  // Load saved config on open
  useEffect(() => {
    if (isOpen) {
      const saved = loadActiveProvider();
      if (saved) {
        setSelectedProvider(saved.provider);
        setApiKey(saved.apiKey);
        setModel(saved.model);
      } else {
        setSelectedProvider('');
        setApiKey('');
        setModel('');
      }
      setStatus(null);
    }
  }, [isOpen]);

  // Reset model when provider changes
  useEffect(() => {
    if (activeProvider) {
      const saved = loadActiveProvider();
      if (saved && saved.provider === selectedProvider && saved.model) {
        setModel(saved.model);
      } else {
        setModel(activeProvider.models[0] || '');
      }
    }
  }, [selectedProvider, activeProvider]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setStatus(null);

    const provider = providers.find((p) => p.id === selectedProvider);
    if (!provider) {
      setStatus({ type: 'error', message: 'Please select a provider.' });
      setIsSaving(false);
      return;
    }
    if (provider.requiresApiKey && !apiKey.trim()) {
      setStatus({ type: 'error', message: `Please enter your ${provider.name} API key.` });
      setIsSaving(false);
      return;
    }
    if (!model.trim()) {
      setStatus({ type: 'error', message: 'Please select a model.' });
      setIsSaving(false);
      return;
    }

    saveActiveProvider({ provider: selectedProvider, apiKey: apiKey.trim(), model: model.trim() });
    setStatus({ type: 'success', message: `Saved. Using ${provider.name} (${model}).` });
    setIsSaving(false);
    onProviderChange?.();
  }, [selectedProvider, apiKey, model, providers, onProviderChange]);

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    setStatus(null);

    try {
      const result = await validateProviderWithBackend(selectedProvider, apiKey, model);
      if (result.ok) {
        setStatus({ type: 'success', message: 'Connection looks good!' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Validation failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Test failed.' });
    } finally {
      setIsTesting(false);
    }
  }, [selectedProvider, apiKey, model]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white dark:bg-charcoal-dark shadow-drawer flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[60px] px-6 border-b border-grey-warm dark:border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-charcoal/60 dark:text-grey-medium" />
                <h2 className="font-display text-xl font-bold text-charcoal dark:text-white">
                  AI Provider
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-charcoal dark:text-white hover:text-burgundy hover:bg-burgundy/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Intro */}
              <p className="text-sm text-charcoal/60 dark:text-grey-medium leading-relaxed">
                Choose your preferred AI provider and enter your API key. Your key is stored
                locally in your browser and sent only to your local backend.
              </p>

              {/* Provider Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal dark:text-white">
                  Provider
                </label>
                <div className="relative">
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className={cn(
                      'w-full appearance-none rounded-lg border border-grey-warm dark:border-white/10',
                      'bg-grey-light dark:bg-charcoal-light/30',
                      'py-2.5 pl-3 pr-10 text-sm text-charcoal dark:text-white',
                      'focus:border-burgundy focus:shadow-input focus:outline-none transition-all'
                    )}
                  >
                    <option value="">Select a provider...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-grey-medium">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Model Select */}
              {activeProvider && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="text-sm font-medium text-charcoal dark:text-white">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className={cn(
                        'w-full appearance-none rounded-lg border border-grey-warm dark:border-white/10',
                        'bg-grey-light dark:bg-charcoal-light/30',
                        'py-2.5 pl-3 pr-10 text-sm text-charcoal dark:text-white',
                        'focus:border-burgundy focus:shadow-input focus:outline-none transition-all'
                      )}
                    >
                      {activeProvider.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-grey-medium">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Key */}
              {activeProvider?.requiresApiKey && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                >
                  <label className="text-sm font-medium text-charcoal dark:text-white">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Your ${activeProvider.name} API key`}
                      className={cn(
                        'w-full rounded-lg border border-grey-warm dark:border-white/10',
                        'bg-grey-light dark:bg-charcoal-light/30',
                        'py-2.5 pl-3 pr-10 text-sm text-charcoal dark:text-white',
                        'placeholder:text-charcoal/40 dark:placeholder:text-grey-medium/60',
                        'focus:border-burgundy focus:shadow-input focus:outline-none transition-all'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-grey-medium hover:text-charcoal dark:hover:text-white transition-colors"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-charcoal/40 dark:text-grey-medium/60">
                    Stored locally in your browser. Never sent anywhere except your local backend.
                  </p>
                </motion.div>
              )}

              {/* Ollama note */}
              {selectedProvider === 'ollama' && (
                <motion.div
                  className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-4 py-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Make sure Ollama is running locally on{' '}
                    <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">
                      http://localhost:11434
                    </code>
                    . No API key needed.
                  </p>
                </motion.div>
              )}

              {/* Status */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border px-4 py-3',
                      status.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-200'
                        : 'bg-burgundyRed/5 border-burgundyRed/20 text-burgundyRed'
                    )}
                  >
                    {status.type === 'success' ? (
                      <Check size={16} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{status.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-grey-warm dark:border-white/10 p-6 flex-shrink-0 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleTest}
                  disabled={isTesting || !selectedProvider}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-grey-warm dark:border-white/10',
                    'px-4 py-2.5 text-sm font-medium text-charcoal dark:text-white',
                    'hover:bg-grey-light dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isTesting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  Test Connection
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !selectedProvider}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 rounded-lg',
                    'bg-charcoal dark:bg-white text-white dark:text-charcoal',
                    'px-4 py-2.5 text-sm font-medium',
                    'hover:bg-charcoal/85 dark:hover:bg-grey-warm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
