import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  username: string;
  loginTime: number;
}

interface UserScore {
  username: string;
  subject: string;
  score: number;
  level: number;
  totalCorrect: number;
  totalAttempts: number;
  timestamp: number;
}

interface UserContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  saveScore: (subject: string, score: number, level: number, totalCorrect: number, totalAttempts: number) => void;
  getAllScores: () => UserScore[];
  getTopScores: (limit?: number) => UserScore[];
  getTopScoresBySubject: (subject: string, limit?: number) => UserScore[];
  getRecentAchievements: (limit?: number) => UserScore[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'he4g_current_user';
const SCORES_STORAGE_KEY = 'he4g_all_scores';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = (username: string) => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      setUser({
        username: trimmedUsername,
        loginTime: Date.now(),
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const saveScore = (
    subject: string,
    score: number,
    level: number,
    totalCorrect: number,
    totalAttempts: number
  ) => {
    if (!user) return;

    const newScore: UserScore = {
      username: user.username,
      subject,
      score,
      level,
      totalCorrect,
      totalAttempts,
      timestamp: Date.now(),
    };

    const saved = localStorage.getItem(SCORES_STORAGE_KEY);
    const scores: UserScore[] = saved ? JSON.parse(saved) : [];
    scores.push(newScore);
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
  };

  const getAllScores = (): UserScore[] => {
    const saved = localStorage.getItem(SCORES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  };

  const getTopScores = (limit: number = 10): UserScore[] => {
    const scores = getAllScores();

    // Group by username and subject, keep only the highest score for each combination
    const bestScores = new Map<string, UserScore>();

    scores.forEach(score => {
      const key = `${score.username}-${score.subject}`;
      const existing = bestScores.get(key);

      if (!existing || score.score > existing.score) {
        bestScores.set(key, score);
      }
    });

    return Array.from(bestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const getTopScoresBySubject = (subject: string, limit: number = 10): UserScore[] => {
    const scores = getAllScores();

    // Group by username for this subject, keep only the highest score per user
    const bestScores = new Map<string, UserScore>();

    scores
      .filter(s => s.subject === subject)
      .forEach(score => {
        const existing = bestScores.get(score.username);

        if (!existing || score.score > existing.score) {
          bestScores.set(score.username, score);
        }
      });

    return Array.from(bestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const getRecentAchievements = (limit: number = 10): UserScore[] => {
    const scores = getAllScores();
    return scores
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        saveScore,
        getAllScores,
        getTopScores,
        getTopScoresBySubject,
        getRecentAchievements,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
