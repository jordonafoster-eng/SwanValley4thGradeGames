import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../../components/game-framework/GameLayout';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import type { GameQuestion } from '../../types/games';
import './MathGame.css';

interface MathGameProps {
  onBack: () => void;
}

type Operation = '+' | '-' | '×' | '÷';
type PowerUpType = 'hint' | 'timeFreeze' | 'multiplier';
type GameMode = 'input' | 'multipleChoice';

interface PowerUp {
  type: PowerUpType;
  name: string;
  icon: string;
  description: string;
  cost: number;
  count: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  emoji: string;
}

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
  const { user, saveScore } = useUser();
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('math');
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion>(() =>
    generateQuestion(progress.level)
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('multipleChoice');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: 'hint', name: 'Crystal Ball', icon: '🔮', description: 'Reveal a hint', cost: 5, count: 3 },
    { type: 'timeFreeze', name: 'Time Stone', icon: '⏱️', description: 'Freeze timer for 10s', cost: 8, count: 2 },
    { type: 'multiplier', name: 'Magic Scroll', icon: '📜', description: '2x points for 3 questions', cost: 10, count: 1 },
  ]);

  // Generate multiple choice options
  const generateMultipleChoiceOptions = (correctAnswer: number) => {
    const options = [correctAnswer];
    const range = Math.max(10, Math.abs(correctAnswer));

    while (options.length < 4) {
      const offset = Math.floor(Math.random() * range) - Math.floor(range / 2);
      const option = correctAnswer + offset;
      if (option !== correctAnswer && !options.includes(option) && option >= 0) {
        options.push(option);
      }
    }

    return options.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const newQuestion = generateQuestion(progress.level);
    setCurrentQuestion(newQuestion);
    setMultipleChoiceOptions(generateMultipleChoiceOptions(Number(newQuestion.answer)));
    setTimeLeft(30);
    setTimerActive(true);
    setShowHint(false);
  }, [progress.level]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeFrozen || feedback !== null) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeFrozen, feedback]);

  const handleTimeUp = () => {
    setFeedback('incorrect');
    addIncorrectAnswer('math');
    setStreak(0);
    setTimerActive(false);

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const createParticles = (emoji: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const usePowerUp = (type: PowerUpType) => {
    const powerUp = powerUps.find(p => p.type === type);
    if (!powerUp || coins < powerUp.cost) return;

    setCoins(prev => prev - powerUp.cost);
    setPowerUps(prev => prev.map(p =>
      p.type === type ? { ...p, count: p.count - 1 } : p
    ));

    switch (type) {
      case 'hint':
        setShowHint(true);
        break;
      case 'timeFreeze':
        setTimeFrozen(true);
        setTimeout(() => setTimeFrozen(false), 10000);
        createParticles('❄️');
        break;
      case 'multiplier':
        setScoreMultiplier(2);
        setTimeout(() => setScoreMultiplier(1), 3 * 30000); // 3 questions worth
        createParticles('✨');
        break;
    }
  };

  const nextQuestion = () => {
    const newQuestion = generateQuestion(progress.level);
    setCurrentQuestion(newQuestion);
    setMultipleChoiceOptions(generateMultipleChoiceOptions(Number(newQuestion.answer)));
    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(30);
    setTimerActive(true);
    setShowHint(false);
  };

  const handleAnswer = (answer: number) => {
    const isCorrect = answer === currentQuestion.answer;
    setTimerActive(false);

    if (isCorrect) {
      setFeedback('correct');
      addCorrectAnswer('math');
      setStreak(prev => prev + 1);

      // Calculate score with time bonus and multiplier
      const basePoints = 10 * progress.level;
      const streakBonus = streak > 0 ? streak * 5 : 0;
      const timeBonus = Math.floor(timeLeft / 3);
      const points = Math.floor((basePoints + streakBonus + timeBonus) * scoreMultiplier);

      setSessionScore(prev => prev + points);

      // Award coins (1 coin per 10 points)
      const coinsEarned = Math.floor(points / 10);
      setCoins(prev => prev + coinsEarned);

      // Check for quest completion (every 5 correct answers)
      if ((progress.totalCorrect + 1) % 5 === 0) {
        setQuestsCompleted(prev => prev + 1);
        createParticles('🏆');
      } else {
        createParticles('⭐');
      }

      // Save score to leaderboard if user is logged in
      if (user) {
        saveScore('math', sessionScore + points, progress.level, progress.totalCorrect + 1, progress.totalAttempts + 1);
      }

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setFeedback('incorrect');
      addIncorrectAnswer('math');
      setStreak(0);
      createParticles('💔');

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer) return;
    handleAnswer(parseInt(userAnswer));
  };

  const handleMultipleChoice = (option: number) => {
    if (feedback !== null) return;
    setUserAnswer(option.toString());
    handleAnswer(option);
  };

  return (
    <GameLayout subject="math" progress={progress} onBack={onBack}>
      <div className="math-game adventure-theme">
        {/* Particle Effects */}
        <div className="particles-container">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            >
              {particle.emoji}
            </div>
          ))}
        </div>

        {/* Quest Header */}
        <div className="quest-header">
          <div className="quest-info">
            <span className="quest-icon">⚔️</span>
            <span className="quest-title">Math Quest - Level {progress.level}</span>
          </div>
          <div className="resources">
            <div className="resource coins">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{coins}</span>
            </div>
            <div className="resource quests">
              <span className="resource-icon">🏆</span>
              <span className="resource-value">{questsCompleted}</span>
            </div>
            <div className="resource score">
              <span className="resource-icon">⭐</span>
              <span className="resource-value">{sessionScore}</span>
            </div>
          </div>
        </div>

        {/* Power-ups Bar */}
        <div className="powerups-bar">
          {powerUps.map((powerUp) => (
            <button
              key={powerUp.type}
              className="powerup-button"
              onClick={() => usePowerUp(powerUp.type)}
              disabled={coins < powerUp.cost || powerUp.count <= 0}
              title={`${powerUp.name}: ${powerUp.description} (Cost: ${powerUp.cost} coins)`}
            >
              <span className="powerup-icon">{powerUp.icon}</span>
              <span className="powerup-cost">{powerUp.cost}🪙</span>
              {powerUp.count > 0 && <span className="powerup-count">x{powerUp.count}</span>}
            </button>
          ))}
          <button
            className="mode-toggle"
            onClick={() => setGameMode(gameMode === 'input' ? 'multipleChoice' : 'input')}
          >
            {gameMode === 'input' ? '🎯 Multiple Choice' : '⌨️ Type Answer'}
          </button>
        </div>

        <div className="game-card">
          {/* Timer */}
          <div className={`timer-bar ${timeFrozen ? 'frozen' : ''} ${timeLeft <= 5 ? 'warning' : ''}`}>
            <div className="timer-fill" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
            <span className="timer-text">{timeFrozen ? '❄️ Frozen' : `⏱️ ${timeLeft}s`}</span>
          </div>

          {streak > 2 && (
            <div className="streak-badge">
              🔥 {streak} streak!
            </div>
          )}

          {scoreMultiplier > 1 && (
            <div className="multiplier-badge">
              ✨ {scoreMultiplier}x Points!
            </div>
          )}

          <div className="question-display">
            <div className="question-text">{currentQuestion.question}</div>
            <div className="equals-sign">=</div>
          </div>

          {showHint && (
            <div className="hint-box">
              🔮 Hint: The answer is between {Math.floor(Number(currentQuestion.answer) / 10) * 10} and {Math.ceil(Number(currentQuestion.answer) / 10) * 10}
            </div>
          )}

          {gameMode === 'input' ? (
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
                Submit Answer
              </button>
            </form>
          ) : (
            <div className="multiple-choice-grid">
              {multipleChoiceOptions.map((option) => (
                <button
                  key={option}
                  className={`choice-button ${
                    feedback && option === currentQuestion.answer ? 'correct-answer' : ''
                  } ${
                    feedback && userAnswer === option.toString() && option !== currentQuestion.answer ? 'wrong-answer' : ''
                  }`}
                  onClick={() => handleMultipleChoice(option)}
                  disabled={feedback !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`feedback ${feedback}`}>
              {feedback === 'correct' ? (
                <>
                  <span className="feedback-icon">✓</span>
                  <span>Quest Complete! +{Math.floor((10 * progress.level + (streak > 0 ? (streak - 1) * 5 : 0) + Math.floor(timeLeft / 3)) * scoreMultiplier)} points</span>
                </>
              ) : (
                <>
                  <span className="feedback-icon">✗</span>
                  <span>The correct answer was {currentQuestion.answer}</span>
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
