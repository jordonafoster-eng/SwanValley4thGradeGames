import { useState, useEffect } from 'react';
import { GameLayout } from '../../components/game-framework/GameLayout';
import { useProgress } from '../../hooks/useProgress';
import { GameQuestion } from '../../types/games';
import './MathGame.css';

interface MathGameProps {
  onBack: () => void;
}

type Operation = '+' | '-' | '×' | '÷';

const generateQuestion = (level: number): GameQuestion => {
  // Difficulty scales with level
  const maxNumber = Math.min(10 + level * 5, 100);
  const minNumber = level > 5 ? 10 : 1;

  const operations: Operation[] = ['+', '-'];

  // Add multiplication at level 3+
  if (level >= 3) {
    operations.push('×');
  }

  // Add division at level 6+
  if (level >= 6) {
    operations.push('÷');
  }

  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number, answer: number;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      answer = num1 + num2;
      break;

    case '-':
      num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      num2 = Math.floor(Math.random() * (num1 - minNumber + 1)) + minNumber;
      answer = num1 - num2;
      break;

    case '×':
      const multiplyMax = Math.min(12, Math.floor(maxNumber / 5));
      num1 = Math.floor(Math.random() * multiplyMax) + 1;
      num2 = Math.floor(Math.random() * multiplyMax) + 1;
      answer = num1 * num2;
      break;

    case '÷':
      // Generate division that results in whole numbers
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * answer;
      break;

    default:
      num1 = num2 = answer = 0;
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    question: `${num1} ${operation} ${num2}`,
    answer: answer,
    difficulty: level,
  };
};

export const MathGame = ({ onBack }: MathGameProps) => {
  const { progress, addCorrectAnswer, addIncorrectAnswer } = useProgress('math');
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion>(() =>
    generateQuestion(progress.level)
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setCurrentQuestion(generateQuestion(progress.level));
  }, [progress.level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;

    if (isCorrect) {
      setFeedback('correct');
      addCorrectAnswer();
      setStreak(prev => prev + 1);

      // Generate next question after short delay
      setTimeout(() => {
        setCurrentQuestion(generateQuestion(progress.level));
        setUserAnswer('');
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback('incorrect');
      addIncorrectAnswer();
      setStreak(0);

      // Clear feedback after delay
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1500);
    }
  };

  return (
    <GameLayout subject="math" progress={progress} onBack={onBack}>
      <div className="math-game">
        <div className="game-card">
          {streak > 2 && (
            <div className="streak-badge">
              🔥 {streak} in a row!
            </div>
          )}

          <div className="question-display">
            <div className="question-text">{currentQuestion.question}</div>
            <div className="equals-sign">=</div>
          </div>

          <form onSubmit={handleSubmit} className="answer-form">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={`answer-input ${feedback ? feedback : ''}`}
              placeholder="?"
              disabled={feedback !== null}
              autoFocus
            />
            <button
              type="submit"
              className="submit-button"
              disabled={!userAnswer || feedback !== null}
            >
              Check Answer
            </button>
          </form>

          {feedback && (
            <div className={`feedback ${feedback}`}>
              {feedback === 'correct' ? (
                <>
                  <span className="feedback-icon">✓</span>
                  <span>Correct! Great job!</span>
                </>
              ) : (
                <>
                  <span className="feedback-icon">✗</span>
                  <span>Not quite. The answer is {currentQuestion.answer}</span>
                </>
              )}
            </div>
          )}

          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Accuracy:</span>
              <span className="stat-value">
                {progress.totalAttempts > 0
                  ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
                  : 0}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Correct:</span>
              <span className="stat-value">{progress.totalCorrect}</span>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};
