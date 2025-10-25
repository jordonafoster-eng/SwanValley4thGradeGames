import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../../components/game-framework/GameLayout';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import type { GameQuestion } from '../../types/games';
import './LogicGame.css';

interface LogicGameProps {
  onBack: () => void;
}

type QuestionType = 'patterns' | 'riddles' | 'sequences' | 'puzzles' | 'factors' | 'spatial' | 'reasoning' | 'wordProblems';
type PowerUpType = 'hint' | 'timeFreeze' | 'multiplier';

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

// 4th grade logic puzzles and questions - M-STEP aligned
const logicQuestions = {
  // 4.OA.C.5 - Number Patterns and Sequences
  patterns: [
    { question: 'What comes next? 2, 4, 6, 8, __', answer: '10', options: ['9', '10', '12', '16'] },
    { question: 'What comes next? 5, 10, 15, 20, __', answer: '25', options: ['22', '24', '25', '30'] },
    { question: 'What comes next? 1, 4, 9, 16, __ (square numbers)', answer: '25', options: ['20', '24', '25', '32'] },
    { question: 'Complete the pattern: △ ○ □ △ ○ __', answer: '□', options: ['△', '○', '□', '◇'] },
    { question: 'What comes next? 100, 90, 80, 70, __', answer: '60', options: ['50', '60', '65', '75'] },
    { question: 'What comes next? 3, 6, 12, 24, __ (doubling)', answer: '48', options: ['36', '40', '48', '50'] },
    { question: 'Pattern: 1, 1, 2, 3, 5, 8, __ (add previous two)', answer: '13', options: ['11', '12', '13', '16'] },
    { question: 'What comes next? 2, 5, 11, 23, __ (double and add 1)', answer: '47', options: ['44', '46', '47', '50'] },
    { question: 'Pattern: 80, 40, 20, 10, __ (halving)', answer: '5', options: ['4', '5', '8', '0'] },
    { question: 'What comes next? 7, 14, 21, 28, __', answer: '35', options: ['30', '32', '35', '42'] },
    { question: 'Pattern: 3, 7, 11, 15, __ (add 4 each time)', answer: '19', options: ['17', '18', '19', '20'] },
    { question: 'Odd numbers: 1, 3, 5, 7, __', answer: '9', options: ['8', '9', '10', '11'] },
    { question: 'Even numbers: 12, 14, 16, 18, __', answer: '20', options: ['19', '20', '22', '24'] },
    { question: 'Pattern: ★ ★ ☆ ★ ★ ☆ ★ ★ __', answer: '☆', options: ['★', '☆', '★★', '☆☆'] },
    { question: 'Geometric: 2, 6, 18, 54, __ (multiply by 3)', answer: '162', options: ['108', '162', '160', '150'] },
    { question: 'Pattern: 50, 45, 40, 35, __ (subtract 5)', answer: '30', options: ['25', '30', '32', '40'] },
  ],

  riddles: [
    { question: 'I have keys but no locks. I have space but no room. What am I?', answer: 'keyboard', options: ['keyboard', 'piano', 'map', 'book'] },
    { question: 'What has hands but cannot clap?', answer: 'clock', options: ['clock', 'watch', 'statue', 'glove'] },
    { question: 'What gets wet while drying?', answer: 'towel', options: ['sponge', 'towel', 'cloth', 'mop'] },
    { question: 'What has a head and tail but no body?', answer: 'coin', options: ['coin', 'snake', 'arrow', 'fish'] },
    { question: 'I am tall when young and short when old. What am I?', answer: 'candle', options: ['tree', 'person', 'candle', 'pencil'] },
    { question: 'What can run but never walks?', answer: 'water', options: ['water', 'wind', 'clock', 'car'] },
    { question: 'What has many teeth but cannot bite?', answer: 'comb', options: ['comb', 'saw', 'zipper', 'fork'] },
    { question: 'What has a face and two hands but no arms or legs?', answer: 'clock', options: ['clock', 'watch', 'person', 'doll'] },
  ],

  sequences: [
    { question: 'If 2 + 3 = 5, and 5 + 4 = 9, what is 7 + 6?', answer: '13', options: ['11', '12', '13', '14'] },
    { question: 'Monday, Tuesday, Wednesday, __, Friday', answer: 'Thursday', options: ['Thursday', 'Saturday', 'Sunday', 'Monday'] },
    { question: 'January, February, March, __, May', answer: 'April', options: ['April', 'June', 'Summer', 'Spring'] },
    { question: 'First, Second, Third, __', answer: 'Fourth', options: ['Four', 'Fourth', 'Last', 'Next'] },
    { question: 'A, C, E, G, __ (skip one letter)', answer: 'I', options: ['H', 'I', 'J', 'K'] },
    { question: 'Z, Y, X, W, __ (backwards)', answer: 'V', options: ['U', 'V', 'T', 'S'] },
  ],

  // 4.OA.A.3 - Multi-step Problem Solving
  puzzles: [
    { question: 'If you have 12 apples and give away 5, how many do you have?', answer: '7', options: ['5', '6', '7', '8'] },
    { question: 'A farmer has 17 sheep. All but 9 run away. How many are left?', answer: '9', options: ['8', '9', '10', '17'] },
    { question: 'How many months have 28 days?', answer: 'all 12', options: ['1', '2', 'all 12', 'none'] },
    { question: 'If two is company and three is a crowd, what are four and five?', answer: 'nine', options: ['seven', 'eight', 'nine', 'many'] },
    { question: 'You have 5 fingers on each hand. How many fingers on 2 hands?', answer: '10', options: ['8', '10', '12', '15'] },
    { question: 'What is half of 20 plus 5?', answer: '15', options: ['10', '12', '15', '25'] },
    { question: 'Multi-step: (6 × 3) + 8 = ?', answer: '26', options: ['22', '24', '26', '27'] },
    { question: 'What is (48 ÷ 6) × 2?', answer: '16', options: ['12', '14', '16', '18'] },
    { question: 'Emma has 24 stickers. She gives 8 to Tom and 6 to Sara. How many left?', answer: '10', options: ['8', '10', '12', '14'] },
  ],

  // 4.OA.B.4 - Factor and Multiple Reasoning
  factors: [
    { question: 'Which number pair multiplies to give 12?', answer: '3 × 4', options: ['2 × 5', '3 × 4', '2 × 7', '5 × 2'] },
    { question: 'What are ALL the factors of 8?', answer: '1,2,4,8', options: ['1,2,4,8', '1,4,8', '2,4,8', '1,2,8'] },
    { question: 'Which is a multiple of 6?', answer: '24', options: ['20', '22', '24', '26'] },
    { question: 'Is 15 a prime or composite number?', answer: 'composite', options: ['prime', 'composite', 'neither', 'both'] },
    { question: 'Which number is prime?', answer: '7', options: ['6', '7', '8', '9'] },
    { question: 'Find factor pairs of 16:', answer: '1×16,2×8,4×4', options: ['1×16,2×8', '1×16,2×8,4×4', '2×8,4×4', '1×16,4×4'] },
    { question: 'Which is NOT a factor of 20?', answer: '6', options: ['4', '5', '6', '10'] },
    { question: 'What is the greatest common factor of 12 and 18?', answer: '6', options: ['3', '4', '6', '9'] },
    { question: 'Which number is divisible by both 3 and 4?', answer: '24', options: ['18', '20', '22', '24'] },
    { question: 'How many factor pairs does 24 have?', answer: '4', options: ['3', '4', '5', '6'] },
    { question: 'Is 2 the only even prime number?', answer: 'yes', options: ['yes', 'no', 'sometimes', 'maybe'] },
  ],

  // 4.G - Spatial Reasoning
  spatial: [
    { question: 'How many lines of symmetry does a square have?', answer: '4', options: ['2', '3', '4', '8'] },
    { question: 'Which shape has exactly 3 lines of symmetry?', answer: 'equilateral triangle', options: ['square', 'rectangle', 'equilateral triangle', 'circle'] },
    { question: 'If you flip the letter "H" horizontally, what do you get?', answer: 'H', options: ['H', 'I', 'T', 'different'] },
    { question: 'A rectangle is rotated 90°. What shape is it now?', answer: 'rectangle', options: ['square', 'rectangle', 'triangle', 'different'] },
    { question: 'Which letter has vertical line symmetry? M, N, P, Q', answer: 'M', options: ['M', 'N', 'P', 'Q'] },
    { question: 'How many right angles in a rectangle?', answer: '4', options: ['2', '3', '4', '0'] },
    { question: 'Which shape has no lines of symmetry?', answer: 'scalene triangle', options: ['circle', 'square', 'scalene triangle', 'rectangle'] },
    { question: 'If you rotate a triangle 360°, where does it end up?', answer: 'same position', options: ['upside down', 'same position', 'sideways', 'different'] },
    { question: 'Does a circle have infinite lines of symmetry?', answer: 'yes', options: ['yes', 'no', '10', '100'] },
  ],

  // Mathematical Reasoning
  reasoning: [
    { question: 'TRUE or FALSE: All squares are rectangles', answer: 'true', options: ['true', 'false'] },
    { question: 'TRUE or FALSE: All rectangles are squares', answer: 'false', options: ['true', 'false'] },
    { question: 'Which is greater: 3/4 or 2/3?', answer: '3/4', options: ['3/4', '2/3', 'equal', 'cannot tell'] },
    { question: 'Which number makes this true? 8 × __ = 48', answer: '6', options: ['5', '6', '7', '8'] },
    { question: 'Is 0.5 equal to 1/2?', answer: 'yes', options: ['yes', 'no', 'sometimes', 'never'] },
    { question: 'Which doesn\'t belong? 2, 4, 6, 9, 10', answer: '9', options: ['2', '6', '9', '10'] },
    { question: 'If A > B and B > C, then:', answer: 'A > C', options: ['A > C', 'C > A', 'A = C', 'cannot tell'] },
    { question: 'Which is the best estimate for 29 + 31?', answer: '60', options: ['50', '60', '70', '80'] },
    { question: 'Round 347 to the nearest hundred:', answer: '300', options: ['300', '340', '350', '400'] },
    { question: 'Which number is closest to 500?', answer: '498', options: ['450', '475', '498', '520'] },
    { question: 'TRUE or FALSE: 6 × 7 = 7 × 6', answer: 'true', options: ['true', 'false'] },
  ],

  // 4.OA.A.3 - Word Problem Logic
  wordProblems: [
    { question: 'Sara is 8 years old. Her mom is 3 times older. How old is her mom?', answer: '24', options: ['11', '16', '24', '32'] },
    { question: 'Tom had $50. He bought a toy for $18 and a book for $12. How much left?', answer: '$20', options: ['$18', '$20', '$22', '$32'] },
    { question: 'A train leaves at 9:30 AM and arrives at 11:15 AM. How long is the trip?', answer: '1h 45min', options: ['1h 30min', '1h 45min', '2h', '2h 15min'] },
    { question: 'Lisa runs 4 miles per day. How many miles in a week (7 days)?', answer: '28', options: ['24', '26', '28', '30'] },
    { question: 'A box has 6 rows of 8 cookies. How many cookies total?', answer: '48', options: ['42', '46', '48', '54'] },
    { question: 'Ben has 5 bags with 7 marbles each. How many marbles total?', answer: '35', options: ['12', '30', '35', '40'] },
    { question: '36 students in 4 equal groups. How many per group?', answer: '9', options: ['7', '8', '9', '10'] },
    { question: 'A book has 240 pages. Jake reads 60 pages. What fraction did he read?', answer: '1/4', options: ['1/3', '1/4', '1/5', '1/6'] },
    { question: 'Concert starts at 7:00 PM. It lasts 2 hours 30 minutes. What time does it end?', answer: '9:30 PM', options: ['9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM'] },
    { question: 'A rectangle is 8 cm long and 5 cm wide. What is its perimeter?', answer: '26 cm', options: ['13 cm', '24 cm', '26 cm', '40 cm'] },
  ],
};

const generateQuestion = (level: number, askedQuestions: Set<string> = new Set()): GameQuestion => {
  // Progressive difficulty - introduce question types based on level
  const types: QuestionType[] = ['patterns', 'puzzles'];

  // Level 2+: Add sequences
  if (level >= 2) {
    types.push('sequences');
  }

  // Level 3+: Add reasoning
  if (level >= 3) {
    types.push('reasoning');
  }

  // Level 4+: Add riddles
  if (level >= 4) {
    types.push('riddles');
  }

  // Level 5+: Add factors
  if (level >= 5) {
    types.push('factors');
  }

  // Level 6+: Add spatial reasoning
  if (level >= 6) {
    types.push('spatial');
  }

  // Level 7+: Add word problems
  if (level >= 7) {
    types.push('wordProblems');
  }

  const type = types[Math.floor(Math.random() * types.length)];
  const questionBank = logicQuestions[type];

  // Filter out already asked questions of this type
  const availableItems = questionBank.filter(item => !askedQuestions.has(`${type}-${item.question}`));

  // If all questions of this type have been asked, reset by using full list
  const itemsToUse = availableItems.length > 0 ? availableItems : questionBank;
  const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

  return {
    id: `${type}-${item.question}`,
    question: item.question,
    answer: item.answer,
    options: item.options,
    difficulty: level,
  };
};

export const LogicGame = ({ onBack }: LogicGameProps) => {
  const { user, saveScore } = useUser();
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('logic');
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion>(() => {
    const question = generateQuestion(progress.level, askedQuestions);
    return question;
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: 'hint', name: 'Rune Stone', icon: '🗿', description: 'Reveal a hint', cost: 5, count: 3 },
    { type: 'timeFreeze', name: 'Norse Frost', icon: '❄️', description: 'Freeze timer for 10s', cost: 8, count: 2 },
    { type: 'multiplier', name: 'Thor\'s Lightning', icon: '⚡', description: '2x points for 3 questions', cost: 10, count: 1 },
  ]);

  useEffect(() => {
    // Reset asked questions when level changes
    setAskedQuestions(new Set());
    const newQuestion = generateQuestion(progress.level, new Set());
    setCurrentQuestion(newQuestion);
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
    addIncorrectAnswer('logic');
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
        setTimeout(() => setScoreMultiplier(1), 3 * 30000);
        createParticles('✨');
        break;
    }
  };

  const nextQuestion = () => {
    // Add current question to the asked questions set
    setAskedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentQuestion.id);

      // Generate new question with updated asked questions
      const newQuestion = generateQuestion(progress.level, newSet);
      setCurrentQuestion(newQuestion);

      return newSet;
    });

    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(30);
    setTimerActive(true);
    setShowHint(false);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer.toLowerCase().trim() === String(currentQuestion.answer).toLowerCase().trim();
    setTimerActive(false);

    if (isCorrect) {
      setFeedback('correct');
      addCorrectAnswer('logic');
      setStreak(prev => prev + 1);

      const basePoints = 10 * progress.level;
      const streakBonus = streak > 0 ? streak * 5 : 0;
      const timeBonus = Math.floor(timeLeft / 3);
      const points = Math.floor((basePoints + streakBonus + timeBonus) * scoreMultiplier);

      setSessionScore(prev => prev + points);

      const coinsEarned = Math.floor(points / 10);
      setCoins(prev => prev + coinsEarned);

      if ((progress.totalCorrect + 1) % 5 === 0) {
        setQuestsCompleted(prev => prev + 1);
        createParticles('🗿');
      } else {
        createParticles('⚡');
      }

      if (user) {
        saveScore('logic', sessionScore + points, progress.level, progress.totalCorrect + 1, progress.totalAttempts + 1);
      }

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setFeedback('incorrect');
      addIncorrectAnswer('logic');
      setStreak(0);
      createParticles('💔');

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  const handleMultipleChoice = (option: string) => {
    if (feedback !== null) return;
    setUserAnswer(option);
    handleAnswer(option);
  };

  return (
    <GameLayout subject="logic" progress={progress} onBack={onBack}>
      <div className="logic-game adventure-theme">
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
            <span className="quest-icon">🗿</span>
            <span className="quest-title">Viking Riddle Quest - Level {progress.level}</span>
          </div>
          <div className="resources">
            <div className="resource coins">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{coins}</span>
            </div>
            <div className="resource quests">
              <span className="resource-icon">🗿</span>
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
          </div>

          {showHint && (
            <div className="hint-box">
              🗿 Hint: The answer starts with "{String(currentQuestion.answer)[0]}"
            </div>
          )}

          <div className="multiple-choice-grid">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                className={`choice-button ${
                  feedback && option === currentQuestion.answer ? 'correct-answer' : ''
                } ${
                  feedback && userAnswer === option && option !== currentQuestion.answer ? 'wrong-answer' : ''
                }`}
                onClick={() => handleMultipleChoice(option)}
                disabled={feedback !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`feedback ${feedback}`}>
              {feedback === 'correct' ? (
                <>
                  <span className="feedback-icon">✓</span>
                  <span>Riddle Conquered! +{Math.floor((10 * progress.level + (streak > 0 ? (streak - 1) * 5 : 0) + Math.floor(timeLeft / 3)) * scoreMultiplier)} points</span>
                </>
              ) : (
                <>
                  <span className="feedback-icon">✗</span>
                  <span>The correct answer was "{currentQuestion.answer}"</span>
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
