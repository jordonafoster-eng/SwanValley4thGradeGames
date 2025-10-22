import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Subject, SubjectProgress, UserProgress } from '../types/games';
import { useUser } from './UserContext';

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
  science: createInitialProgress(),
  logic: createInitialProgress(),
});

interface ProgressContextType {
  progress: SubjectProgress;
  getSubjectProgress: (subject: Subject) => UserProgress;
  addCorrectAnswer: (subject: Subject) => void;
  addIncorrectAnswer: (subject: Subject) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const storageKey = user?.username ? `${STORAGE_KEY_PREFIX}${user.username}` : `${STORAGE_KEY_PREFIX}guest`;

  const [progress, setProgress] = useState<SubjectProgress>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : createInitialSubjectProgress();
  });

  // Reload progress when user changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setProgress(saved ? JSON.parse(saved) : createInitialSubjectProgress());
  }, [storageKey]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  const getSubjectProgress = (subject: Subject): UserProgress => {
    return progress[subject];
  };

  const addCorrectAnswer = (subject: Subject) => {
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

  const addIncorrectAnswer = (subject: Subject) => {
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

  return (
    <ProgressContext.Provider
      value={{
        progress,
        getSubjectProgress,
        addCorrectAnswer,
        addIncorrectAnswer,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
