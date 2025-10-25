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
type QuestionType = 'arithmetic' | 'fractionEquivalence' | 'fractionCompare' | 'fractionAdd' | 'fractionMultiply' | 'fractionDecimal' | 'multiDigitMultiply' | 'divisionRemainder' | 'wordProblem' | 'multiplicativeComparison' | 'factorPairs' | 'primeComposite' | 'measurement' | 'geometry';

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

// Helper functions for M-STEP aligned questions
const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const simplifyFraction = (num: number, den: number): [number, number] => {
  const divisor = gcd(num, den);
  return [num / divisor, den / divisor];
};

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const getFactorPairs = (n: number): number[][] => {
  const pairs: number[][] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      pairs.push([i, n / i]);
    }
  }
  return pairs;
};

const generateQuestion = (level: number): GameQuestion => {
  // Define available question types based on level
  const availableTypes: QuestionType[] = [];

  // Level 1-2: Basic arithmetic
  if (level >= 1) {
    availableTypes.push('arithmetic');
  }

  // Level 2+: Fraction equivalence (M-STEP priority)
  if (level >= 2) {
    availableTypes.push('fractionEquivalence', 'fractionCompare');
  }

  // Level 3+: Multi-digit multiplication, fraction operations
  if (level >= 3) {
    availableTypes.push('multiDigitMultiply', 'fractionAdd', 'fractionDecimal');
  }

  // Level 4+: Division with remainders, word problems
  if (level >= 4) {
    availableTypes.push('divisionRemainder', 'wordProblem', 'fractionMultiply');
  }

  // Level 5+: Factor pairs, multiplicative comparison
  if (level >= 5) {
    availableTypes.push('factorPairs', 'multiplicativeComparison', 'primeComposite');
  }

  // Level 6+: Measurement and geometry
  if (level >= 6) {
    availableTypes.push('measurement', 'geometry');
  }

  const questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

  switch (questionType) {
    case 'arithmetic': {
      const operations: Operation[] = ['+', '-'];
      if (level >= 3) operations.push('×');
      if (level >= 6) operations.push('÷');

      const operation = operations[Math.floor(Math.random() * operations.length)];
      const maxNumber = Math.min(10 + level * 5, 100);
      const minNumber = level > 5 ? 10 : 1;

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
        case '×': {
          const multiplyMax = Math.min(12, Math.floor(maxNumber / 5));
          num1 = Math.floor(Math.random() * multiplyMax) + 1;
          num2 = Math.floor(Math.random() * multiplyMax) + 1;
          answer = num1 * num2;
          break;
        }
        case '÷':
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
    }

    case 'fractionEquivalence': {
      // Generate equivalent fractions like 1/2 = ?/4
      const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
      const baseDen = denominators[Math.floor(Math.random() * denominators.length)];
      const baseNum = Math.floor(Math.random() * (baseDen - 1)) + 1;
      const [simpleNum, simpleDen] = simplifyFraction(baseNum, baseDen);

      const multiplier = Math.floor(Math.random() * 3) + 2;
      const targetNum = simpleNum * multiplier;
      const targetDen = simpleDen * multiplier;

      if (Math.random() > 0.5) {
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `${simpleNum}/${simpleDen} = ?/${targetDen}`,
          answer: targetNum,
          difficulty: level,
        };
      } else {
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `${targetNum}/${targetDen} = ${simpleNum}/?`,
          answer: simpleDen,
          difficulty: level,
        };
      }
    }

    case 'fractionCompare': {
      // Which is greater: 2/3 or 3/4?
      const fractions = [
        [1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 5], [3, 4], [3, 5], [4, 5],
        [2, 4], [3, 6], [4, 8], [5, 10]
      ];

      const [num1, den1] = fractions[Math.floor(Math.random() * fractions.length)];
      let [num2, den2] = fractions[Math.floor(Math.random() * fractions.length)];

      while (num1 / den1 === num2 / den2) {
        [num2, den2] = fractions[Math.floor(Math.random() * fractions.length)];
      }

      const val1 = num1 / den1;
      const val2 = num2 / den2;
      const answer = val1 > val2 ? 1 : 2;

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `Which is greater? (1) ${num1}/${den1} or (2) ${num2}/${den2}`,
        answer: answer,
        difficulty: level,
      };
    }

    case 'fractionAdd': {
      // Add fractions with like denominators
      const denominators = [4, 5, 6, 8, 10, 12];
      const den = denominators[Math.floor(Math.random() * denominators.length)];
      const num1 = Math.floor(Math.random() * (den - 1)) + 1;
      const num2 = Math.floor(Math.random() * (den - num1));
      const answer = num1 + num2;

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `${num1}/${den} + ${num2}/${den} = ?/${den}`,
        answer: answer,
        difficulty: level,
      };
    }

    case 'fractionMultiply': {
      // Multiply fraction by whole number
      const denominators = [2, 3, 4, 5, 6, 8];
      const den = denominators[Math.floor(Math.random() * denominators.length)];
      const num = 1;
      const whole = Math.floor(Math.random() * 5) + 2;
      const answer = whole * num;

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `${whole} × ${num}/${den} = ?/${den}`,
        answer: answer,
        difficulty: level,
      };
    }

    case 'fractionDecimal': {
      // Convert fraction to decimal
      const conversions = [
        { fraction: '1/10', decimal: 0.1, answer: 1 },
        { fraction: '3/10', decimal: 0.3, answer: 3 },
        { fraction: '5/10', decimal: 0.5, answer: 5 },
        { fraction: '25/100', decimal: 0.25, answer: 25 },
        { fraction: '50/100', decimal: 0.5, answer: 50 },
        { fraction: '75/100', decimal: 0.75, answer: 75 },
      ];

      const conversion = conversions[Math.floor(Math.random() * conversions.length)];

      if (Math.random() > 0.5) {
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `${conversion.fraction} = 0.? (Enter the missing digits)`,
          answer: conversion.answer,
          difficulty: level,
        };
      } else {
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `0.${conversion.decimal.toString().split('.')[1] || '0'} = ?/${conversion.fraction.split('/')[1]}`,
          answer: Number(conversion.fraction.split('/')[0]),
          difficulty: level,
        };
      }
    }

    case 'multiDigitMultiply': {
      // Multi-digit multiplication
      if (level < 5) {
        // Single digit × two digit
        const num1 = Math.floor(Math.random() * 900) + 100;
        const num2 = Math.floor(Math.random() * 8) + 2;
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `${num1} × ${num2}`,
          answer: num1 * num2,
          difficulty: level,
        };
      } else {
        // Two digit × two digit
        const num1 = Math.floor(Math.random() * 80) + 10;
        const num2 = Math.floor(Math.random() * 80) + 10;
        return {
          id: `${Date.now()}-${Math.random()}`,
          question: `${num1} × ${num2}`,
          answer: num1 * num2,
          difficulty: level,
        };
      }
    }

    case 'divisionRemainder': {
      // Division with remainders
      const divisor = Math.floor(Math.random() * 8) + 2;
      const quotient = Math.floor(Math.random() * 10) + 1;
      const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
      const dividend = divisor * quotient + remainder;

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `${dividend} ÷ ${divisor} = ${quotient} R? (What is the remainder?)`,
        answer: remainder,
        difficulty: level,
      };
    }

    case 'wordProblem': {
      const problems = [
        {
          question: 'Sarah has 24 apples. She wants to share them equally among 6 friends. How many apples does each friend get?',
          answer: 4,
        },
        {
          question: 'A school bus makes 3 trips. Each trip carries 28 students. How many students total?',
          answer: 84,
        },
        {
          question: 'Jake bought 5 packs of trading cards. Each pack has 12 cards. How many cards total?',
          answer: 60,
        },
        {
          question: 'A baker made 48 cookies. She put 8 cookies in each box. How many boxes did she fill?',
          answer: 6,
        },
        {
          question: 'Emma read 15 pages on Monday and 23 pages on Tuesday. How many pages in total?',
          answer: 38,
        },
        {
          question: 'A garden has 4 rows of flowers. Each row has 9 flowers. How many flowers total?',
          answer: 36,
        },
        {
          question: 'Tom had 50 marbles. He gave 18 to his friend. How many marbles does Tom have left?',
          answer: 32,
        },
      ];

      const problem = problems[Math.floor(Math.random() * problems.length)];
      return {
        id: `${Date.now()}-${Math.random()}`,
        question: problem.question,
        answer: problem.answer,
        difficulty: level,
      };
    }

    case 'multiplicativeComparison': {
      const base = Math.floor(Math.random() * 8) + 2;
      const multiplier = Math.floor(Math.random() * 4) + 2;
      const result = base * multiplier;

      const problems = [
        {
          question: `Max has ${base} toys. Lisa has ${multiplier} times as many. How many toys does Lisa have?`,
          answer: result,
        },
        {
          question: `A cat weighs ${base} pounds. A dog weighs ${multiplier} times as much. How many pounds does the dog weigh?`,
          answer: result,
        },
      ];

      const problem = problems[Math.floor(Math.random() * problems.length)];
      return {
        id: `${Date.now()}-${Math.random()}`,
        question: problem.question,
        answer: problem.answer,
        difficulty: level,
      };
    }

    case 'factorPairs': {
      const numbers = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40];
      const num = numbers[Math.floor(Math.random() * numbers.length)];
      const pairs = getFactorPairs(num);
      const targetPair = pairs[Math.floor(Math.random() * pairs.length)];

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `${targetPair[0]} × ? = ${num}`,
        answer: targetPair[1],
        difficulty: level,
      };
    }

    case 'primeComposite': {
      const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const num = numbers[Math.floor(Math.random() * numbers.length)];
      const answer = isPrime(num) ? 1 : 2;

      return {
        id: `${Date.now()}-${Math.random()}`,
        question: `Is ${num} (1) Prime or (2) Composite?`,
        answer: answer,
        difficulty: level,
      };
    }

    case 'measurement': {
      const problems = [
        {
          question: 'A rectangle has length 8 cm and width 5 cm. What is the area in square cm?',
          answer: 40,
        },
        {
          question: 'A rectangle has length 12 m and width 7 m. What is the perimeter in meters?',
          answer: 38,
        },
        {
          question: 'How many inches are in 3 feet? (1 foot = 12 inches)',
          answer: 36,
        },
        {
          question: 'How many centimeters are in 2 meters? (1 meter = 100 cm)',
          answer: 200,
        },
        {
          question: 'A right angle measures how many degrees?',
          answer: 90,
        },
      ];

      const problem = problems[Math.floor(Math.random() * problems.length)];
      return {
        id: `${Date.now()}-${Math.random()}`,
        question: problem.question,
        answer: problem.answer,
        difficulty: level,
      };
    }

    case 'geometry': {
      const problems = [
        {
          question: 'How many sides does a quadrilateral have?',
          answer: 4,
        },
        {
          question: 'How many lines of symmetry does a square have?',
          answer: 4,
        },
        {
          question: 'How many right angles does a rectangle have?',
          answer: 4,
        },
        {
          question: 'How many parallel sides does a parallelogram have? (Enter pairs: 1 pair = 1, 2 pairs = 2)',
          answer: 2,
        },
      ];

      const problem = problems[Math.floor(Math.random() * problems.length)];
      return {
        id: `${Date.now()}-${Math.random()}`,
        question: problem.question,
        answer: problem.answer,
        difficulty: level,
      };
    }

    default:
      return {
        id: `${Date.now()}-${Math.random()}`,
        question: '2 + 2',
        answer: 4,
        difficulty: level,
      };
  }
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
    { type: 'hint', name: 'Rune Stone', icon: '📿', description: 'Reveal a hint', cost: 5, count: 3 },
    { type: 'timeFreeze', name: 'Norse Frost', icon: '❄️', description: 'Freeze timer for 10s', cost: 8, count: 2 },
    { type: 'multiplier', name: 'Thor\'s Lightning', icon: '⚡', description: '2x points for 3 questions', cost: 10, count: 1 },
  ]);

  // Generate multiple choice options
  const generateMultipleChoiceOptions = (correctAnswer: number) => {
    const options = [correctAnswer];

    // For small answers (like 1-10), use closer range
    const range = correctAnswer <= 10 ? 5 : Math.max(10, Math.abs(correctAnswer));
    const maxAttempts = 50; // Prevent infinite loops
    let attempts = 0;

    while (options.length < 4 && attempts < maxAttempts) {
      attempts++;
      const offset = Math.floor(Math.random() * range) - Math.floor(range / 2);
      const option = correctAnswer + offset;

      // Ensure option is valid and unique
      if (option !== correctAnswer && !options.includes(option) && option >= 0) {
        options.push(option);
      }
    }

    // If we couldn't generate enough unique options, add some manually
    while (options.length < 4) {
      const fallback = correctAnswer + options.length;
      if (!options.includes(fallback) && fallback >= 0) {
        options.push(fallback);
      } else {
        options.push(Math.max(0, correctAnswer - options.length));
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
        createParticles('🛡️');
      } else {
        createParticles('⚡');
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
            <span className="quest-icon">⚓</span>
            <span className="quest-title">Viking Math Voyage - Level {progress.level}</span>
          </div>
          <div className="resources">
            <div className="resource coins">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{coins}</span>
            </div>
            <div className="resource quests">
              <span className="resource-icon">🛡️</span>
              <span className="resource-value">{questsCompleted}</span>
            </div>
            <div className="resource score">
              <span className="resource-icon">💎</span>
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
              📿 Hint: {Number(currentQuestion.answer) <= 20
                ? `The answer is between ${Math.max(0, Number(currentQuestion.answer) - 2)} and ${Number(currentQuestion.answer) + 2}`
                : `The answer is between ${Math.floor(Number(currentQuestion.answer) / 10) * 10} and ${Math.ceil(Number(currentQuestion.answer) / 10) * 10 + 10}`
              }
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
                  <span>Viking Victory! +{Math.floor((10 * progress.level + (streak > 0 ? (streak - 1) * 5 : 0) + Math.floor(timeLeft / 3)) * scoreMultiplier)} points</span>
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
