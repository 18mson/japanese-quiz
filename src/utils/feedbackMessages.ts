// Encouraging feedback messages pool for correct and incorrect answers

export const CORRECT_FEEDBACK_POOL = [
  'Tepat sekali! 🌟',
  'Sugoi! ⚡',
  'Lancar jaya! 🔥',
  'Mantap! ✨',
  'Keren banget! 🎉',
  'Hebat! 💪',
  'Jos! 🚀',
  'Persis! 🎯'
];

export const RETRY_FEEDBACK_POOL = [
  'Hampir! 🎯',
  'Coba lagi ya! 💪',
  'Sedikit lagi! ✨',
  'Ayo fokus! 🔥',
  'Jangan menyerah! 🚀'
];

export const getRandomCorrectFeedback = (): string => {
  const idx = Math.floor(Math.random() * CORRECT_FEEDBACK_POOL.length);
  return CORRECT_FEEDBACK_POOL[idx];
};

export const getRandomRetryFeedback = (): string => {
  const idx = Math.floor(Math.random() * RETRY_FEEDBACK_POOL.length);
  return RETRY_FEEDBACK_POOL[idx];
};
