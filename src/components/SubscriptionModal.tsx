import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChartNoAxesCombined,
  Clock3,
  Crown,
  Download,
  Layers3,
  PencilLine,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  onUpgradeSuccess: () => void;
}

const valuePoints = [
  {
    icon: Zap,
    title: 'Capture it while it is fresh',
    description: 'Write a task in plain language and let quick capture pick up dates, priorities, and tags.',
  },
  {
    icon: Workflow,
    title: 'See what is moving',
    description: 'Keep notes in status lanes, then switch to the Executive Standup Wall for a team-style overview.',
  },
  {
    icon: Clock3,
    title: 'Make room for focused work',
    description: 'Choose a task, start a focus session, and review your progress in Analytics.',
  },
  {
    icon: PencilLine,
    title: 'Work the way you think',
    description: 'Use handwritten sticky notes, color, checklists, and the open Canvas Wall to develop ideas.',
  },
];

const includedTools = [
  { icon: Layers3, label: 'Board, projects, and canvas in one workspace' },
  { icon: ChartNoAxesCombined, label: 'Progress trends and next-step insights' },
  { icon: Download, label: 'Markdown and JSON export for portable backups' },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isProUser,
  onUpgradeSuccess,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    window.setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
      confetti({
        particleCount: 48,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6d45f5', '#10b981', '#ec4899'],
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
        className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-stone-200 bg-[#fffdf8] p-5 shadow-2xl dark:border-white/10 dark:bg-[#171714] sm:p-8"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 bg-gradient-to-r from-amber-400/20 via-violet-500/15 to-emerald-400/15 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close plan preview"
          className="absolute right-4 top-4 z-10 rounded-xl p-2 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="relative mb-6 pr-8 sm:pr-10">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
            <Crown className="h-3.5 w-3.5" />
            Omni Sticky Pro · plan preview
          </div>
          <h2 id="subscription-title" className="max-w-xl text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            One workspace. Fewer loose ends.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Omni Sticky brings capture, planning, focus, and review together—so ideas become clear next actions without scattering them across apps.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {valuePoints.map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex gap-3 rounded-2xl border border-stone-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-stone-200/80 bg-stone-100/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">A calmer way to keep work together</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {includedTools.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-2 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 dark:from-amber-500/[0.08] dark:to-orange-500/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">Planned subscription price</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-3xl font-black tracking-tight text-stone-950 dark:text-white">
                {billingPeriod === 'yearly' ? '$49' : '$6'}
              </span>
              <span className="text-sm text-stone-600 dark:text-stone-300">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
              {billingPeriod === 'yearly' && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">About $4.08/month</span>}
            </div>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{billingPeriod === 'yearly' ? 'Billed annually' : 'Billed monthly'} · pricing shown for preview</p>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-[270px]">
            <div className="flex rounded-xl border border-stone-200 bg-white/80 p-1 text-xs font-semibold dark:border-white/10 dark:bg-black/15">
              <button type="button" aria-pressed={billingPeriod === 'monthly'} onClick={() => setBillingPeriod('monthly')} className={`flex-1 rounded-lg px-3 py-2 transition ${billingPeriod === 'monthly' ? 'bg-white text-stone-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                Monthly · $6
              </button>
              <button type="button" aria-pressed={billingPeriod === 'yearly'} onClick={() => setBillingPeriod('yearly')} className={`flex-1 rounded-lg px-3 py-2 transition ${billingPeriod === 'yearly' ? 'bg-white text-stone-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                Yearly · $49
              </button>
            </div>
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing || isProUser}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-70 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
            >
              {isProcessing ? 'Opening preview…' : isProUser ? <><Check className="h-4 w-4" /> Pro preview active</> : <>Explore Pro preview <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          This version is a product preview: checkout and paid-feature access controls are not connected. Selecting the button only marks Pro as active in this browser; no payment is taken.
        </p>
      </section>
    </div>
  );
};
