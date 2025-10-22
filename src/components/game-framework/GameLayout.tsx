import type { ReactNode } from 'react';
import type { Subject, UserProgress } from '../../types/games';
import './GameLayout.css';

interface GameLayoutProps {
  subject: Subject;
  progress: UserProgress;
  children: ReactNode;
  onBack: () => void;
}

export const GameLayout = ({ subject, progress, children, onBack }: GameLayoutProps) => {
  const subjectColors: Record<Subject, string> = {
    math: '#4CAF50',
    reading: '#2196F3',
    science: '#FF9800',
    logic: '#9C27B0',
  };

  const subjectTitles: Record<Subject, string> = {
    math: 'Math',
    reading: 'Reading & Language',
    science: 'Science',
    logic: 'Logic & Puzzles',
  };

  const color = subjectColors[subject];

  return (
    <div className="game-layout">
      <header className="game-header" style={{ backgroundColor: color }}>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="header-content">
          <h1>{subjectTitles[subject]}</h1>
          <div className="header-progress">
            <span className="level-display">Level {progress.level}</span>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{ width: `${(progress.exp / progress.expToNextLevel) * 100}%` }}
              />
            </div>
            <span className="xp-text">
              {progress.exp} / {progress.expToNextLevel} XP
            </span>
          </div>
        </div>
      </header>

      <main className="game-content">{children}</main>
    </div>
  );
};
