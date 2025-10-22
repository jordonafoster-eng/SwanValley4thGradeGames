import type { SubjectCategory } from '../types/games';
import { useProgress } from '../contexts/ProgressContext';
import { useUser } from '../contexts/UserContext';
import { LoginBar } from './LoginBar';
import './HomePage.css';

const subjects: SubjectCategory[] = [
  {
    id: 'math',
    title: 'Math',
    description: 'Addition, subtraction, multiplication, division, and more!',
    icon: '🔢',
    color: '#6A0DAD',
  },
  {
    id: 'reading',
    title: 'Reading & Language',
    description: 'Spelling, vocabulary, grammar, and comprehension',
    icon: '📚',
    color: '#5B2C6F',
  },
  {
    id: 'science',
    title: 'Science',
    description: 'Explore experiments and natural phenomena',
    icon: '🔬',
    color: '#7B2CBF',
  },
  {
    id: 'logic',
    title: 'Logic & Puzzles',
    description: 'Problem-solving and critical thinking challenges',
    icon: '🧩',
    color: '#4B0082',
  },
];

interface HomePageProps {
  onSelectSubject: (subject: SubjectCategory['id']) => void;
  onViewLeaderboard: () => void;
}

export const HomePage = ({ onSelectSubject, onViewLeaderboard }: HomePageProps) => {
  const { user, logout } = useUser();
  const { progress } = useProgress();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🎓 Havens Elementary 4th Grade Games</h1>
        <p className="subtitle">
          {user ? 'Choose a subject to start learning!' : 'Please log in to start playing!'}
        </p>
        {user && (
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user.username}!</span>
            <button onClick={onViewLeaderboard} className="leaderboard-nav-button">
              🏆 Leaderboard
            </button>
            <button onClick={logout} className="logout-nav-button">
              Logout
            </button>
          </div>
        )}
      </header>

      {!user ? (
        <div className="login-container">
          <LoginBar />
        </div>
      ) : (
        <div className="subjects-grid">
        {subjects.map((subject) => {
          const subjectProgress = progress[subject.id];
          const accuracy = subjectProgress.totalAttempts > 0
            ? Math.round((subjectProgress.totalCorrect / subjectProgress.totalAttempts) * 100)
            : 0;

          return (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => onSelectSubject(subject.id)}
              style={{ borderColor: subject.color }}
            >
              <div className="subject-icon" style={{ backgroundColor: subject.color }}>
                {subject.icon}
              </div>
              <h2>{subject.title}</h2>
              <p className="subject-description">{subject.description}</p>

              <div className="progress-info">
                <div className="level-badge" style={{ backgroundColor: subject.color }}>
                  Level {subjectProgress.level}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(subjectProgress.exp / subjectProgress.expToNextLevel) * 100}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
                <div className="progress-text">
                  {subjectProgress.exp} / {subjectProgress.expToNextLevel} XP
                </div>
                {subjectProgress.totalAttempts > 0 && (
                  <div className="accuracy-text">
                    Accuracy: {accuracy}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
