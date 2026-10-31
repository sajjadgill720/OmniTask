import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Clock, 
  Layers, 
  Lock, 
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  onUpgradeSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isProUser,
  onUpgradeSuccess,
}) => {
  if (!isOpen) return null;

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
      });
    }, 900);
  };

  const proFeatures = [
    {
      title: 'Unlimited Hyperrealistic Sticky Walls',
      desc: 'Create infinite corporate agile whiteboard walls & studio canvases with 3D physical pushpins.',
    },
    {
      title: 'Full Interactive Widgets Hub',
      desc: 'Lockscreen-style Today widgets, Standby desk clock, and floating desktop sticky pads.',
    },
    {
      title: 'Deep Focus Pomodoro Engine',
      desc: 'Custom focus blocks with acoustic chimes and live task progress tracking.',
    },
    {
      title: '16.7M RGB Paper & Ink Customization',
      desc: 'WCAG AAA contrast engine with authentic ballpoint blue, charcoal, and chalk pen styles.',
    },
    {
      title: 'Zero Vendor Lock-in & Cloud Backup',
      desc: 'One-click Markdown & JSON full database export & restore anytime.',
    },
    {
      title: 'Unlimited Project & Area Swimlanes',
      desc: 'Organize personal goals, sprint backlogs, and client roadmaps with progress rings.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-blue-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>OmniSticky Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Supercharge Your Daily Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            The instant capture speed of tactile sticky notes with enterprise agile whiteboard lanes & desktop widgets.
          </p>
        </div>

        {/* Billing Period Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Monthly ($6/mo)
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition cursor-pointer ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <span>Yearly ($49/yr)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                SAVE 32%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Highlight Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-white/5 dark:to-indigo-950/20 border border-slate-200/80 dark:border-white/10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {billingPeriod === 'yearly' ? '$4.08' : '$6.00'}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {billingPeriod === 'yearly' ? 'Billed annually at $49/year • Cancel anytime' : 'Billed monthly • Cancel anytime'}
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing || isProUser}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 hover:from-amber-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Activating Pro...</span>
            ) : isProUser ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>You Have OmniSticky Pro!</span>
              </>
            ) : (
              <>
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Pro Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {proFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {f.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee & Trust Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted • Local-First Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-blue-500" />
            <span>30-Day Money Back Guarantee</span>
          </div>
        </div>

      </div>

    </div>
  );
};
