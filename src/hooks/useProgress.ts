import { useState, useEffect } from 'react';
import type { Subject, SubjectProgress, UserProgress } from '../types/games';

const STORAGE_KEY_PREFIX = 'he4g_progress_';

const createInitialProgress = (): UserProgress => ({
  level: 1,
  exp: 0,
  expToNextLevel: 10,
  totalCorrect: 0,
  totalAttempts: 0,
});

const createInitialSubjectProgress = (): SubjectProgress => ({
  math: createInitialProgress(),
  reading: createInitialProgress(),
  grammar: createInitialProgress(),
  science: createInitialProgress(),
  logic: createInitialProgress(),
});

export const useProgress = (subject: Subject, username?: string) => {
  const storageKey = username ? `${STORAGE_KEY_PREFIX}${username}` : `${STORAGE_KEY_PREFIX}guest`;

  const [progress, setProgress] = useState<SubjectProgress>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : createInitialSubjectProgress();
  });

  // Reset progress when username changes (different user logs in)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setProgress(saved ? JSON.parse(saved) : createInitialSubjectProgress());
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  const addCorrectAnswer = () => {
    setProgress((prev) => {
      const subjectProgress = prev[subject];
      const newExp = subjectProgress.exp + 1;
      const newTotalCorrect = subjectProgress.totalCorrect + 1;
      const newTotalAttempts = subjectProgress.totalAttempts + 1;

      // Level up logic
      if (newExp >= subjectProgress.expToNextLevel) {
        const newLevel = subjectProgress.level + 1;
        // Exponential growth: each level requires more exp
        const newExpToNextLevel = Math.floor(10 * Math.pow(1.2, newLevel - 1));

        return {
          ...prev,
          [subject]: {
            level: newLevel,
            exp: 0,
            expToNextLevel: newExpToNextLevel,
            totalCorrect: newTotalCorrect,
            totalAttempts: newTotalAttempts,
          },
        };
      }

      return {
        ...prev,
        [subject]: {
          ...subjectProgress,
          exp: newExp,
          totalCorrect: newTotalCorrect,
          totalAttempts: newTotalAttempts,
        },
      };
    });
  };

  const addIncorrectAnswer = () => {
    setProgress((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        totalAttempts: prev[subject].totalAttempts + 1,
      },
    }));
  };

  const resetProgress = () => {
    setProgress(createInitialSubjectProgress());
  };

  return {
    progress: progress[subject],
    allProgress: progress,
    addCorrectAnswer,
    addIncorrectAnswer,
    resetProgress,
  };
};
