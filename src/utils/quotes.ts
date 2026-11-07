export interface FocusQuote {
  id: string;
  quote: string;
  author: string;
  theme?: string;
}

export const HYPER_FOCUS_QUOTES: FocusQuote[] = [
  {
    id: 'q1',
    quote: 'Do less, but do it with complete presence.',
    author: 'Marcus Aurelius',
    theme: 'Essentialism',
  },
  {
    id: 'q2',
    quote: 'In a world of constant noise, quiet concentration is a superpower.',
    author: 'Cal Newport',
    theme: 'Deep Work',
  },
  {
    id: 'q3',
    quote: 'Simplicity boils down to two steps: Identify the essential. Eliminate the rest.',
    author: 'Leo Babauta',
    theme: 'Clarity',
  },
  {
    id: 'q4',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    theme: 'Habits',
  },
  {
    id: 'q5',
    quote: 'Concentrate all your thoughts upon the work at hand. The sun\'s rays do not burn until brought to a focus.',
    author: 'Alexander Graham Bell',
    theme: 'Hyper-Focus',
  },
  {
    id: 'q6',
    quote: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    theme: 'Mindfulness',
  },
  {
    id: 'q7',
    quote: 'Action expands possibilities; overthinking shrinks them.',
    author: 'Lao Tzu',
    theme: 'Momentum',
  },
  {
    id: 'q8',
    quote: 'To do two things at once is to do neither.',
    author: 'Publilius Syrus',
    theme: 'Single-tasking',
  },
  {
    id: 'q9',
    quote: 'Subtract the obvious, add the meaningful.',
    author: 'John Maeda',
    theme: 'Simplicity',
  },
  {
    id: 'q10',
    quote: 'One task at a time. Finish what you started before moving on.',
    author: 'Zen Principle',
    theme: 'Flow',
  },
  {
    id: 'q11',
    quote: 'Focus is not saying yes to the thing you have to focus on. It is saying no to the hundred other good ideas.',
    author: 'Steve Jobs',
    theme: 'Prioritization',
  },
  {
    id: 'q12',
    quote: 'The secret of getting ahead is getting started on the single next step.',
    author: 'Mark Twain',
    theme: 'Initiative',
  },
  {
    id: 'q13',
    quote: 'Clarity precedes mastery. Know your target before you pull the bow.',
    author: 'Robin Sharma',
    theme: 'Direction',
  },
  {
    id: 'q14',
    quote: 'Your focus determines your reality.',
    author: 'Qui-Gon Jinn',
    theme: 'Perspective',
  },
  {
    id: 'q15',
    quote: 'Small deeds done are greater than great deeds planned.',
    author: 'Peter Marshall',
    theme: 'Execution',
  },
  {
    id: 'q16',
    quote: 'Be like water making its way through cracks. Adjust to the object, and you shall find a way round or through it.',
    author: 'Bruce Lee',
    theme: 'Resilience',
  },
  {
    id: 'q17',
    quote: 'Quiet the mind, and the soul will speak with clarity.',
    author: 'Ma Jaya Sati Bhagavati',
    theme: 'Inner Peace',
  },
  {
    id: 'q18',
    quote: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
    theme: 'Purpose',
  },
  {
    id: 'q19',
    quote: 'Flow is being completely involved in an activity for its own sake.',
    author: 'Mihaly Csikszentmihalyi',
    theme: 'Flow State',
  },
  {
    id: 'q20',
    quote: 'The shorter the delay between thought and action, the greater the progress.',
    author: 'Marcus Aurelius',
    theme: 'Immediacy',
  },
];

/**
 * Returns a deterministic quote for the current calendar day.
 * Rotates daily without needing any network calls or state bloat.
 */
export function getDailyHyperFocusQuote(dayOffset = 0): FocusQuote {
  const now = new Date();
  if (dayOffset !== 0) {
    now.setDate(now.getDate() + dayOffset);
  }
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs((dayOfYear + dayOffset) % HYPER_FOCUS_QUOTES.length);
  return HYPER_FOCUS_QUOTES[index];
}

