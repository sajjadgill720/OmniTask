export interface FocusQuote { id: string; quote: string; author: string; theme?: string; }
export const HYPER_FOCUS_QUOTES: FocusQuote[] = [
  'Choose one small task. Give it your full attention.',
  'A clear next step makes room for progress.',
  'Write it down. Let your mind breathe.',
  'Leave a little space for a fresh idea.',
  'A quiet moment can be part of the work.',
  'Make a plan that leaves room for life.',
  'Finish one small thing before adding another.',
  'Celebrate the work you actually did today.',
  'Your next step does not have to be a big one.',
  'Keep what matters in view.',
  'Start with the thought that keeps coming back.',
  'Dream big. Plan better. Execute daily.',
].map((quote, index) => ({ id: `q${index + 1}`, quote, author: 'Omni Sticky', theme: 'Daily prompt' }));
export function getDailyHyperFocusQuote(dayOffset = 0): FocusQuote {
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const index = ((day + dayOffset) % HYPER_FOCUS_QUOTES.length + HYPER_FOCUS_QUOTES.length) % HYPER_FOCUS_QUOTES.length;
  return HYPER_FOCUS_QUOTES[index];
}
