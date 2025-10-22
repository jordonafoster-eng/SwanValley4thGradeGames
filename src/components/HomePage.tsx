import { SubjectCategory } from '../types/games';
import { useProgress } from '../hooks/useProgress';
import './HomePage.css';

const subjects: SubjectCategory[] = [
  {
    id: 'math',
    title: 'Math',
    description: 'Addition, subtraction, multiplication, division, and more!',
    icon: '🔢',
    color: '#4CAF50',
  },
  {
    id: 'reading',
    title: 'Reading & Language',
    description: 'Spelling, vocabulary, grammar, and comprehension',
    icon: '📚',
    color: '#2196F3',
  },
  {
    id: 'science',
    title: 'Science',
    description: 'Explore experiments and natural phenomena',
    icon: '🔬',
    color: '#FF9800',
  },
  {
    id: 'logic',
    title: 'Logic & Puzzles',
    description: 'Problem-solving and critical thinking challenges',
    icon: '🧩',
    color: '#9C27B0',
  },
];

interface HomePageProps {
  onSelectSubject: (subject: SubjectCategory['id']) => void;
}

export const HomePage = ({ onSelectSubject }: HomePageProps) => {
  const mathProgress = useProgress('math');
  const readingProgress = useProgress('reading');
  const scienceProgress = useProgress('science');
  const logicProgress = useProgress('logic');

  const progressMap = {
    math: mathProgress.progress,
    reading: readingProgress.progress,
    science: scienceProgress.progress,
    logic: logicProgress.progress,
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🎓 Swan Valley 4th Grade Games</h1>
        <p className="subtitle">Choose a subject to start learning!</p>
      </header>

      <div className="subjects-grid">
        {subjects.map((subject) => {
          const progress = progressMap[subject.id];
          const accuracy = progress.totalAttempts > 0
            ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
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
                  Level {progress.level}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(progress.exp / progress.expToNextLevel) * 100}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
                <div className="progress-text">
                  {progress.exp} / {progress.expToNextLevel} XP
                </div>
                {progress.totalAttempts > 0 && (
                  <div className="accuracy-text">
                    Accuracy: {accuracy}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
