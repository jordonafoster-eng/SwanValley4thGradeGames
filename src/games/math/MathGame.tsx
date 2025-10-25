import { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import './MathGame.css';

interface MathGameProps {
  onBack: () => void;
}

type Operation = '+' | '-' | '×' | '÷';

interface Question {
  question: string;
  answer: number;
  operation: Operation;
}

const generateQuestion = (level: number): Question => {
  const operations: Operation[] = ['+', '-', '×', '÷'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number, answer: number;

  switch (operation) {
    case '+': {
      // 2-4 digit addition
      const digits = Math.min(2 + Math.floor(level / 3), 4);
      const maxNumber = Math.pow(10, digits) - 1;
      const minNumber = Math.pow(10, digits - 1);

      num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      answer = num1 + num2;
      break;
    }
    case '-': {
      // 2-4 digit subtraction
      const digits = Math.min(2 + Math.floor(level / 3), 4);
      const maxNumber = Math.pow(10, digits) - 1;
      const minNumber = Math.pow(10, digits - 1);

      num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      num2 = Math.floor(Math.random() * (num1 - minNumber + 1)) + minNumber;
      answer = num1 - num2;
      break;
    }
    case '×': {
      // Basic multiplication (times tables up to 12x12)
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    }
    case '÷': {
      // Basic division (using times tables)
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * answer;
      break;
    }
    default:
      num1 = num2 = answer = 0;
  }

  return {
    question: `${num1} ${operation} ${num2}`,
    answer: answer,
    operation: operation,
  };
};

export const MathGame = ({ onBack }: MathGameProps) => {
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('math');

  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(progress.level));
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; icon: string }[]>([]);
  const [showQuest, setShowQuest] = useState(false);

  const createParticles = (x: number, y: number, icon: string) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      icon,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showFeedback || !userAnswer.trim()) return;

    const numAnswer = Number(userAnswer);
    const correct = numAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Create particles at center of input
    const inputElement = document.querySelector('.answer-input');
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createParticles(x, y, correct ? '⚡' : '❌');
    }

    if (correct) {
      addCorrectAnswer('math');
      setStreak(prev => prev + 1);
      setCoins(prev => prev + 10);

      if ((streak + 1) % 5 === 0) {
        setShowQuest(true);
        setCoins(prev => prev + 50);
        setTimeout(() => setShowQuest(false), 2000);
      }
    } else {
      addIncorrectAnswer('math');
      setStreak(0);
    }

    setQuestionsAnswered(prev => prev + 1);

    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');
      setCurrentQuestion(generateQuestion(progress.level));
    }, 2000);
  };

  const getFeedbackMessage = () => {
    if (!isCorrect) return "Not quite! Try the next one!";

    const messages = [
      "Viking Victory! 🎉",
      "Saga Complete! ⚓",
      "Math Master! ⚔️",
      "Brilliant! 🌟",
      "Well Done! 🏆"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="math-game">
      <div className="game-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h1>⚓ Viking Math Voyage</h1>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Level</span>
          <span className="stat-value">{progress.level}</span>
        </div>
        <div className="stat">
          <span className="stat-label">XP</span>
          <span className="stat-value">{progress.exp}/{progress.expToNextLevel}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value streak-value">{streak} 🔥</span>
        </div>
        <div className="stat">
          <span className="stat-label">Coins</span>
          <span className="stat-value coins-value">{coins} 🪙</span>
        </div>
      </div>

      <div className="exp-bar">
        <div
          className="exp-fill"
          style={{ width: `${(progress.exp / progress.expToNextLevel) * 100}%` }}
        />
      </div>

      {showQuest && (
        <div className="quest-notification">
          ⚓ Quest Complete! 5 in a row! +50 Bonus Coins! ⚓
        </div>
      )}

      <div className="game-content">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">Question {questionsAnswered + 1}</span>
          </div>

          <div className="question-display">
            <div className="question-text">{currentQuestion.question} = ?</div>
          </div>

          <form onSubmit={handleSubmit} className="answer-form">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="answer-input"
              placeholder="Enter your answer"
              disabled={showFeedback}
              autoFocus
            />
            <button
              type="submit"
              className="submit-button"
              disabled={showFeedback || !userAnswer.trim()}
            >
              Submit
            </button>
          </form>

          {showFeedback && (
            <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              <p className="feedback-message">{getFeedbackMessage()}</p>
              {!isCorrect && (
                <p className="correct-answer">
                  Correct answer: <strong>{currentQuestion.answer}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        >
          {particle.icon}
        </div>
      ))}
    </div>
  );
};
