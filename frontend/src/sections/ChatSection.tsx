import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { SummaryData, ChatMessage } from '@/services/localAIService';
import { askQuestion, generateSuggestedQuestions, checkBackendStatus } from '@/services/localAIService';

interface ChatSectionProps {
  videoUrl: string;
  summary: SummaryData['summary'];
  videoId?: string;
}

function generateLocalSuggestedQuestions(summary: SummaryData['summary']): string[] {
  const questions: string[] = [];
  if (summary.tldr) {
    questions.push('Can you explain the main idea in more detail?');
  }
  if (summary.analogies && summary.analogies.length > 0) {
    const a = summary.analogies[0];
    questions.push(`How does the "${a.concept}" analogy help me understand this?`);
  }
  if (summary.keyTakeaways && summary.keyTakeaways.length > 0) {
    questions.push('What is the most important takeaway and why?');
  }
  if (summary.deepSummary && summary.deepSummary.length > 0) {
    questions.push('What are some real-world applications of this?');
  }
  return questions.slice(0, 4);
}

export default function ChatSection({ videoUrl, summary }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check backend and load suggested questions on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const status = await checkBackendStatus();
      const ready = status.ok && status.aiReady;
      if (cancelled) return;
      setBackendReady(ready);

      if (ready) {
        try {
          const questions = await generateSuggestedQuestions(summary);
          if (cancelled) return;
          setSuggestedQuestions(questions.slice(0, 4));
        } catch (err) {
          console.warn('[Chat] Failed to load suggested questions:', err);
          setSuggestedQuestions(generateLocalSuggestedQuestions(summary));
        }
      } else {
        setSuggestedQuestions(generateLocalSuggestedQuestions(summary));
      }
      setIsLoadingQuestions(false);
    }

    init();
    return () => { cancelled = true; };
  }, [summary]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAnswer]);

  const handleSend = useCallback(async (question: string) => {
    if (!question.trim() || isLoadingAnswer) return;

    const trimmed = question.trim();
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoadingAnswer(true);
    setError(null);

    try {
      if (!backendReady) {
        // Mock mode: simple echo-style response
        await new Promise((r) => setTimeout(r, 1200));
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content:
              "I'm running in demo mode right now. Configure an AI provider in settings to ask real follow-up questions about this video.",
          },
        ]);
        return;
      }

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const answer = await askQuestion(videoUrl, summary, trimmed, history);
      setMessages([...newMessages, { role: 'assistant', content: answer }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setMessages(newMessages);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [messages, isLoadingAnswer, backendReady, videoUrl, summary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-burgundy" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/50 dark:text-grey-medium transition-colors duration-500">
          Ask AI
        </span>
      </div>
      <h2 className="font-display text-2xl md:text-[30px] font-medium text-charcoal dark:text-white leading-[1.15] mb-8 transition-colors duration-500">
        Follow-up Questions
      </h2>
      <div className="h-px bg-charcoal/10 dark:bg-white/5 mb-8 transition-colors duration-500" />

      {/* Suggested questions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-burgundy" />
          <span className="text-sm font-medium text-charcoal/60 dark:text-grey-medium transition-colors duration-500">
            Suggested questions
          </span>
        </div>

        {isLoadingQuestions ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-48 rounded-full bg-charcoal/5 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                onClick={() => handleSend(q)}
                disabled={isLoadingAnswer}
                className="inline-flex items-center rounded-full border border-charcoal/10 dark:border-white/10 px-4 py-2 text-sm text-charcoal/70 dark:text-grey-medium hover:border-burgundy/40 hover:text-burgundy dark:hover:text-burgundy-light hover:bg-burgundy/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="space-y-5 mb-6">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-burgundy/10 text-burgundy'
                    : 'bg-charcoal dark:bg-white text-white dark:text-charcoal'
                }`}
              >
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] leading-[1.65] ${
                  msg.role === 'assistant'
                    ? 'bg-grey-light dark:bg-charcoal-light/30 text-charcoal dark:text-grey-medium'
                    : 'bg-charcoal dark:bg-white text-white dark:text-charcoal'
                } transition-colors duration-500`}
              >
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('**') && line.endsWith('**') ? 'font-semibold mb-1' : 'mb-1 last:mb-0'}>
                      {line.replace(/^\*\*|\*\*$/g, '')}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoadingAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-grey-light dark:bg-charcoal-light/30 rounded-2xl px-5 py-3.5 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-burgundy" />
              <span className="text-sm text-charcoal/50 dark:text-grey-medium">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-start gap-2 rounded-lg bg-burgundyRed/10 border border-burgundyRed/20 px-4 py-3 text-sm text-burgundyRed"
          >
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 rounded-full border border-charcoal/10 dark:border-white/10 bg-white dark:bg-charcoal-dark px-5 py-3 shadow-card transition-colors duration-500 focus-within:shadow-input focus-within:border-burgundy/30">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              backendReady === false
                ? 'Backend not connected — demo mode only'
                : 'Ask a follow-up question...'
            }
            disabled={isLoadingAnswer}
            className="flex-1 bg-transparent text-[15px] text-charcoal dark:text-white placeholder:text-charcoal/40 dark:placeholder:text-grey-medium/60 focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoadingAnswer || !inputValue.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal flex items-center justify-center hover:bg-charcoal/85 dark:hover:bg-grey-warm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      {!backendReady && messages.length === 0 && (
        <p className="mt-3 text-xs text-charcoal/40 dark:text-grey-medium/60 text-center transition-colors duration-500">
          Configure an AI provider in settings to unlock full AI Q&A.
        </p>
      )}
    </section>
  );
}
