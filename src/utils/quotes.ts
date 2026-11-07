export interface FocusQuote {
  id: string;
  quote: string;
  author: string;
  theme?: string;
}

export const HYPER_FOCUS_QUOTES: FocusQuote[] = [
  // 1-15: Discipline & Consistency
  { id: 'q1', quote: 'Do less, but do it with complete presence.', author: 'Marcus Aurelius', theme: 'Essentialism' },
  { id: 'q2', quote: 'In a world of constant noise, quiet concentration is a superpower.', author: 'Cal Newport', theme: 'Deep Work' },
  { id: 'q3', quote: 'Simplicity boils down to two steps: Identify the essential. Eliminate the rest.', author: 'Leo Babauta', theme: 'Clarity' },
  { id: 'q4', quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', theme: 'Habits' },
  { id: 'q5', quote: 'Concentrate all your thoughts upon the work at hand. The sun\'s rays do not burn until brought to a focus.', author: 'Alexander Graham Bell', theme: 'Hyper-Focus' },
  { id: 'q6', quote: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca', theme: 'Mindfulness' },
  { id: 'q7', quote: 'Action expands possibilities; overthinking shrinks them.', author: 'Lao Tzu', theme: 'Momentum' },
  { id: 'q8', quote: 'To do two things at once is to do neither.', author: 'Publilius Syrus', theme: 'Single-tasking' },
  { id: 'q9', quote: 'Subtract the obvious, add the meaningful.', author: 'John Maeda', theme: 'Simplicity' },
  { id: 'q10', quote: 'One task at a time. Finish what you started before moving on.', author: 'Zen Proverb', theme: 'Flow' },
  { id: 'q11', quote: 'Focus is not saying yes to the thing you have to focus on. It is saying no to the hundred other good ideas.', author: 'Steve Jobs', theme: 'Prioritization' },
  { id: 'q12', quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain', theme: 'Initiative' },
  { id: 'q13', quote: 'Clarity precedes mastery. Know your target before you pull the bow.', author: 'Robin Sharma', theme: 'Direction' },
  { id: 'q14', quote: 'Your focus determines your reality.', author: 'George Lucas', theme: 'Perspective' },
  { id: 'q15', quote: 'Small deeds done are greater than great deeds planned.', author: 'Peter Marshall', theme: 'Execution' },

  // 16-30: Ambition & Drive
  { id: 'q16', quote: 'Be like water making its way through cracks. Adjust to the object, and you shall find a way round or through it.', author: 'Bruce Lee', theme: 'Resilience' },
  { id: 'q17', quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln', theme: 'Discipline' },
  { id: 'q18', quote: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche', theme: 'Purpose' },
  { id: 'q19', quote: 'Flow is being completely involved in an activity for its own sake.', author: 'Mihaly Csikszentmihalyi', theme: 'Flow State' },
  { id: 'q20', quote: 'The shorter the delay between thought and action, the greater the progress.', author: 'Marcus Aurelius', theme: 'Immediacy' },
  { id: 'q21', quote: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh', theme: 'Craft' },
  { id: 'q22', quote: 'Small steps every day lead to remarkable places.', author: 'Anonymous', theme: 'Consistency' },
  { id: 'q23', quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant', theme: 'Habits' },
  { id: 'q24', quote: 'Don\'t count the days, make the days count.', author: 'Muhammad Ali', theme: 'Presence' },
  { id: 'q25', quote: 'Energy flows where attention goes.', author: 'Tony Robbins', theme: 'Focus' },
  { id: 'q26', quote: 'The most difficult thing is the decision to act; the rest is merely tenacity.', author: 'Amelia Earhart', theme: 'Courage' },
  { id: 'q27', quote: 'Either you run the day or the day runs you.', author: 'Jim Rohn', theme: 'Control' },
  { id: 'q28', quote: 'Doubt kills more dreams than failure ever will.', author: 'Suzy Kassem', theme: 'Belief' },
  { id: 'q29', quote: 'Action is the foundational key to all success.', author: 'Pablo Picasso', theme: 'Action' },
  { id: 'q30', quote: 'Amateurs sit and wait for inspiration; the rest of us just get up and go to work.', author: 'Stephen King', theme: 'Discipline' },

  // 31-45: Productivity & Deep Work
  { id: 'q31', quote: 'Deep work is the ability to focus without distraction on a cognitively demanding task.', author: 'Cal Newport', theme: 'Deep Work' },
  { id: 'q32', quote: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', theme: 'Resourcefulness' },
  { id: 'q33', quote: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela', theme: 'Perseverance' },
  { id: 'q34', quote: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier', theme: 'Persistence' },
  { id: 'q35', quote: 'Until we can manage time, we can manage nothing else.', author: 'Peter Drucker', theme: 'Management' },
  { id: 'q36', quote: 'The best way to predict the future is to create it.', author: 'Peter Drucker', theme: 'Vision' },
  { id: 'q37', quote: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson', theme: 'Momentum' },
  { id: 'q38', quote: 'Lost time is never found again.', author: 'Benjamin Franklin', theme: 'Urgency' },
  { id: 'q39', quote: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra', theme: 'Architecture' },
  { id: 'q40', quote: 'Focus on being productive instead of busy.', author: 'Tim Ferriss', theme: 'Productivity' },
  { id: 'q41', quote: 'Productivity is being able to do things that you were never able to do before.', author: 'Franz Kafka', theme: 'Growth' },
  { id: 'q42', quote: 'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.', author: 'Stephen Covey', theme: 'Priorities' },
  { id: 'q43', quote: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll', theme: 'Mindset' },
  { id: 'q44', quote: 'Quality is not an act, it is a habit.', author: 'Aristotle', theme: 'Excellence' },
  { id: 'q45', quote: 'Continuous improvement is better than delayed perfection.', author: 'Mark Twain', theme: 'Iteration' },

  // 46-60: Creativity & Entrepreneurship
  { id: 'q46', quote: 'Creativity is intelligence having fun.', author: 'Albert Einstein', theme: 'Creativity' },
  { id: 'q47', quote: 'You can\'t use up creativity. The more you use, the more you have.', author: 'Maya Angelou', theme: 'Creativity' },
  { id: 'q48', quote: 'Ideas are easy. Implementation is hard.', author: 'Guy Kawasaki', theme: 'Execution' },
  { id: 'q49', quote: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', theme: 'Action' },
  { id: 'q50', quote: 'If you really look closely, most overnight successes took a long time.', author: 'Steve Jobs', theme: 'Persistence' },
  { id: 'q51', quote: 'An idea not coupled with action will never get any bigger than the brain cell it occupied.', author: 'Arnold H. Glasow', theme: 'Action' },
  { id: 'q52', quote: 'Make each day your masterpiece.', author: 'John Wooden', theme: 'Craft' },
  { id: 'q53', quote: 'Do one thing every day that scares you.', author: 'Eleanor Roosevelt', theme: 'Courage' },
  { id: 'q54', quote: 'Originality is nothing but judicious imitation.', author: 'Voltaire', theme: 'Inspiration' },
  { id: 'q55', quote: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry', theme: 'Planning' },
  { id: 'q56', quote: 'Don\'t wait for extraordinary opportunities. Seize common occasions and make them great.', author: 'Orison Swett Marden', theme: 'Ambition' },
  { id: 'q57', quote: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair', theme: 'Bravery' },
  { id: 'q58', quote: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey', theme: 'Resilience' },
  { id: 'q59', quote: 'The journey of a thousand miles begins with one step.', author: 'Lao Tzu', theme: 'Beginning' },
  { id: 'q60', quote: 'What would you do if you were not afraid?', author: 'Spencer Johnson', theme: 'Courage' },

  // 61-75: Focus & Flow
  { id: 'q61', quote: 'Concentration is the secret of strength in politics, in war, in trade, in short in all management of human affairs.', author: 'Ralph Waldo Emerson', theme: 'Focus' },
  { id: 'q62', quote: 'The main thing is to keep the main thing the main thing.', author: 'Stephen Covey', theme: 'Priority' },
  { id: 'q63', quote: 'Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.', author: 'Zig Ziglar', theme: 'Clarity' },
  { id: 'q64', quote: 'Never mistake motion for action.', author: 'Ernest Hemingway', theme: 'Efficiency' },
  { id: 'q65', quote: 'Peace comes from within. Do not seek it without.', author: 'Buddha', theme: 'Stillness' },
  { id: 'q66', quote: 'If you spend too much time thinking about a thing, you\'ll never get it done.', author: 'Bruce Lee', theme: 'Action' },
  { id: 'q67', quote: 'He who conquers himself is the mightiest warrior.', author: 'Confucius', theme: 'Mastery' },
  { id: 'q68', quote: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus', theme: 'Identity' },
  { id: 'q69', quote: 'Adopt the pace of nature: her secret is patience.', author: 'Ralph Waldo Emerson', theme: 'Patience' },
  { id: 'q70', quote: 'Courage is resistance to fear, mastery of fear, not absence of fear.', author: 'Mark Twain', theme: 'Courage' },
  { id: 'q71', quote: 'Waste no more time arguing what a good person should be. Be one.', author: 'Marcus Aurelius', theme: 'Integrity' },
  { id: 'q72', quote: 'Patience is bitter, but its fruit is sweet.', author: 'Jean-Jacques Rousseau', theme: 'Endurance' },
  { id: 'q73', quote: 'He who is contented is rich.', author: 'Lao Tzu', theme: 'Contentment' },
  { id: 'q74', quote: 'Look back at your progress when the climb feels steep.', author: 'Anonymous', theme: 'Perspective' },
  { id: 'q75', quote: 'The mind is everything. What you think you become.', author: 'Buddha', theme: 'Mindset' },

  // 76-90: Mastery & Craft
  { id: 'q76', quote: 'Mastery is not a function of genius or talent, it is a function of time and intense focus.', author: 'Robert Greene', theme: 'Mastery' },
  { id: 'q77', quote: 'Genius is one percent inspiration and ninety-nine percent perspiration.', author: 'Thomas Edison', theme: 'Effort' },
  { id: 'q78', quote: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.', author: 'Thomas Edison', theme: 'Optimism' },
  { id: 'q79', quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', theme: 'Artistry' },
  { id: 'q80', quote: 'Details make perfection, and perfection is not a detail.', author: 'Leonardo da Vinci', theme: 'Craft' },
  { id: 'q81', quote: 'The price of anything is the amount of life you exchange for it.', author: 'Henry David Thoreau', theme: 'Value' },
  { id: 'q82', quote: 'Go confidently in the direction of your dreams. Live the life you have imagined.', author: 'Henry David Thoreau', theme: 'Ambition' },
  { id: 'q83', quote: 'Knowing is not enough; we must apply. Willing is not enough; we must do.', author: 'Johann Wolfgang von Goethe', theme: 'Application' },
  { id: 'q84', quote: 'Magic is believing in yourself; if you can do that, you can make anything happen.', author: 'Johann Wolfgang von Goethe', theme: 'Belief' },
  { id: 'q85', quote: 'There are no shortcuts to any place worth going.', author: 'Beverly Sills', theme: 'Diligence' },
  { id: 'q86', quote: 'Hard choices, easy life. Easy choices, hard life.', author: 'Jerzy Gregorek', theme: 'Discipline' },
  { id: 'q87', quote: 'Fall seven times, stand up eight.', author: 'Japanese Proverb', theme: 'Resilience' },
  { id: 'q88', quote: 'Success is getting what you want, happiness is wanting what you get.', author: 'W.P. Kinsella', theme: 'Gratitude' },
  { id: 'q89', quote: 'A smooth sea never made a skilled sailor.', author: 'Franklin D. Roosevelt', theme: 'Strength' },
  { id: 'q90', quote: 'The only limit to our realization of tomorrow will be our doubts of today.', author: 'Franklin D. Roosevelt', theme: 'Hope' },

  // 91-105: Growth & Transcendence
  { id: 'q91', quote: 'Do not wait; the time will never be \'just right.\' Start where you stand.', author: 'Napoleon Hill', theme: 'Initiative' },
  { id: 'q92', quote: 'Strength does not come from winning. Your struggles develop your strengths.', author: 'Arnold Schwarzenegger', theme: 'Struggle' },
  { id: 'q93', quote: 'If you want to lift yourself up, lift up someone else.', author: 'Booker T. Washington', theme: 'Generosity' },
  { id: 'q94', quote: 'You must be the change you wish to see in the world.', author: 'Mahatma Gandhi', theme: 'Leadership' },
  { id: 'q95', quote: 'An unexamined life is not worth living.', author: 'Socrates', theme: 'Reflection' },
  { id: 'q96', quote: 'Be curious, not judgmental.', author: 'Walt Whitman', theme: 'Openness' },
  { id: 'q97', quote: 'A champion is defined not by their wins but by how they can recover when they fall.', author: 'Serena Williams', theme: 'Grit' },
  { id: 'q98', quote: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky', theme: 'Boldness' },
  { id: 'q99', quote: 'The power of imagination makes us infinite.', author: 'John Muir', theme: 'Imagination' },
  { id: 'q100', quote: 'Dream big. Plan better. Execute daily.', author: 'Studio Knovera', theme: 'Manifesto' },
  { id: 'q101', quote: 'Nothing will work unless you do.', author: 'Maya Angelou', theme: 'Work Ethic' },
  { id: 'q102', quote: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', theme: 'Confidence' },
  { id: 'q103', quote: 'Keep your face always toward the sunshine—and shadows will fall behind you.', author: 'Walt Whitman', theme: 'Optimism' },
  { id: 'q104', quote: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle Onassis', theme: 'Hope' },
  { id: 'q105', quote: 'Every moment is a fresh beginning.', author: 'T.S. Eliot', theme: 'Renewal' },
];

/**
 * Deterministically returns the quote for today based on calendar date.
 * Does not randomly change on page refresh or component re-renders.
 */
export function getDailyHyperFocusQuote(dayOffset = 0): FocusQuote {
  const now = new Date();
  if (dayOffset !== 0) {
    now.setDate(now.getDate() + dayOffset);
  }
  // Calculate deterministic day of year (0-365)
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const yearSeed = now.getFullYear() * 365;
  const index = Math.abs((yearSeed + dayOfYear + dayOffset) % HYPER_FOCUS_QUOTES.length);
  return HYPER_FOCUS_QUOTES[index];
}
