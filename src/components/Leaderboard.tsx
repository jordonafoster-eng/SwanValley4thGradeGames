import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import type { Subject } from '../types/games';
import './Leaderboard.css';

type LeaderboardView = 'overall' | 'math' | 'reading' | 'science' | 'logic' | 'recent';

export function Leaderboard() {
  const { getTopScores, getTopScoresBySubject, getRecentAchievements } = useUser();
  const [view, setView] = useState<LeaderboardView>('overall');

  const getScoresForView = () => {
    switch (view) {
      case 'overall':
        return getTopScores(10);
      case 'recent':
        return getRecentAchievements(10);
      case 'math':
      case 'reading':
      case 'science':
      case 'logic':
        return getTopScoresBySubject(view, 10);
      default:
        return [];
    }
  };

  const scores = getScoresForView();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getSubjectColor = (subject: string): string => {
    const colors: Record<Subject, string> = {
      math: '#667eea',
      reading: '#f093fb',
      science: '#4facfe',
      logic: '#43e97b'
    };
    return colors[subject as Subject] || '#667eea';
  };

  const getTrophy = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Leaderboard</h2>

      <div className="leaderboard-tabs">
        <button
          className={`tab ${view === 'overall' ? 'active' : ''}`}
          onClick={() => setView('overall')}
        >
          Overall
        </button>
        <button
          className={`tab ${view === 'math' ? 'active' : ''}`}
          onClick={() => setView('math')}
        >
          Math
        </button>
        <button
          className={`tab ${view === 'reading' ? 'active' : ''}`}
          onClick={() => setView('reading')}
        >
          Reading
        </button>
        <button
          className={`tab ${view === 'science' ? 'active' : ''}`}
          onClick={() => setView('science')}
        >
          Science
        </button>
        <button
          className={`tab ${view === 'logic' ? 'active' : ''}`}
          onClick={() => setView('logic')}
        >
          Logic
        </button>
        <button
          className={`tab ${view === 'recent' ? 'active' : ''}`}
          onClick={() => setView('recent')}
        >
          Recent
        </button>
      </div>

      <div className="leaderboard-content">
        {scores.length === 0 ? (
          <div className="empty-state">
            <p>No scores yet! Be the first to play and earn a spot on the leaderboard!</p>
          </div>
        ) : (
          <div className="scores-list">
            {scores.map((score, index) => (
              <div key={`${score.username}-${score.timestamp}`} className="score-entry">
                <div className="score-rank">
                  {getTrophy(index)}
                </div>
                <div className="score-info">
                  <div className="score-username">{score.username}</div>
                  <div className="score-details">
                    <span
                      className="score-subject"
                      style={{ color: getSubjectColor(score.subject) }}
                    >
                      {score.subject.charAt(0).toUpperCase() + score.subject.slice(1)}
                    </span>
                    <span className="score-level">Level {score.level}</span>
                    {view === 'recent' && (
                      <span className="score-date">{formatDate(score.timestamp)}</span>
                    )}
                  </div>
                </div>
                <div className="score-stats">
                  <div className="score-points">{score.score} pts</div>
                  <div className="score-accuracy">
                    {score.totalAttempts > 0
                      ? Math.round((score.totalCorrect / score.totalAttempts) * 100)
                      : 0}% accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
