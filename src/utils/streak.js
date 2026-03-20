import streakMessages from './streakMessages.json';

/**
 * Calculate the total number of consecutive streak days ending today.
 */
export function getTotalNumberOfStreaks(problemsPerDay) {
  const streakDates = Object.keys(problemsPerDay)
    .filter((date) => problemsPerDay[date] > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (streakDates.length === 0) return 0;

  let streaks = 1;
  for (let i = 1; i < streakDates.length; i++) {
    const prev = new Date(streakDates[i - 1]);
    const curr = new Date(streakDates[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streaks++;
    } else {
      break;
    }
  }
  return streaks;
}

/**
 * Group solved problems by date.
 */
export function formatProblemsPerDay(problemsSolved) {
  const result = {};
  problemsSolved.forEach((problem) => {
    const date = new Date(problem.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = (result[dateStr] || 0) + 1;
  });
  return result;
}

/**
 * Generate a title and message based on streak count.
 */
export function generateTitle(dailyProblemsSolved) {
  if (dailyProblemsSolved == null || isNaN(dailyProblemsSolved)) dailyProblemsSolved = 0;
  if (dailyProblemsSolved < 0) dailyProblemsSolved = 0;
  const entry =
    streakMessages.find((t) => t.level === dailyProblemsSolved) ||
    streakMessages[streakMessages.length - 1];
  return [entry.title, entry.message];
}
