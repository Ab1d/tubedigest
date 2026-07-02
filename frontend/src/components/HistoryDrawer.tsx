import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Search, Trash2 } from 'lucide-react';
import type { SummaryData } from '@/services/mockAIService';
import { cn } from '@/lib/utils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: SummaryData[];
  onSelectItem: (item: SummaryData) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}: HistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.videoTitle.toLowerCase().includes(q) ||
        item.channelName.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
            className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-white shadow-drawer flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[60px] px-6 border-b border-grey-warm flex-shrink-0">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal">History</h2>
                <span className="text-[13px] text-grey-medium">
                  {history.length} summary{history.length !== 1 ? 'ies' : 'y'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-charcoal hover:text-burgundy hover:bg-burgundy/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            {history.length > 0 && (
              <div className="px-4 pt-4 pb-2 flex-shrink-0">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-medium"
                  />
                  <input
                    type="text"
                    placeholder="Search summaries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-grey-warm bg-grey-light py-2 pl-9 pr-3 text-sm text-charcoal placeholder:text-grey-medium focus:border-burgundy focus:shadow-input focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Clock size={48} className="text-grey-warm mb-4" />
                  <p className="text-base font-medium text-grey-medium">
                    {searchQuery ? 'No matches found' : 'No summaries yet'}
                  </p>
                  <p className="text-sm text-grey-medium mt-1">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Your summarized videos will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((item) => (
                    <motion.div
                      key={item.id}
                      className={cn(
                        'group flex items-center gap-3 w-full rounded-lg px-3 py-3',
                        'border-l-2 border-transparent',
                        'hover:bg-burgundy/5 hover:border-l-burgundy transition-all duration-200'
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        onClick={() => {
                          onSelectItem(item);
                          onClose();
                        }}
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={item.videoTitle}
                          className="w-20 h-[54px] rounded object-cover flex-shrink-0 bg-grey-light"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal truncate">
                            {item.videoTitle}
                          </p>
                          <p className="text-xs text-grey-medium mt-0.5">
                            {item.channelName} &bull; {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-grey-medium bg-grey-light px-1.5 py-0.5 rounded flex-shrink-0">
                          {item.duration}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 rounded p-1.5 text-charcoal/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="border-t border-grey-warm p-4 flex-shrink-0">
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full rounded border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
                >
                  Clear All History
                </button>

                {showConfirm && (
                  <motion.div
                    className="mt-3 rounded-lg bg-grey-light p-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-sm text-charcoal mb-3">
                      Are you sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onClearAll();
                          setShowConfirm(false);
                        }}
                        className="flex-1 rounded bg-destructive px-3 py-1.5 text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 rounded border border-grey-warm px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
