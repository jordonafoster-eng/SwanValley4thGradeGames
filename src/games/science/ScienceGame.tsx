import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../../components/game-framework/GameLayout';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import type { GameQuestion } from '../../types/games';
import './ScienceGame.css';

interface ScienceGameProps {
  onBack: () => void;
}

type QuestionType = 'energy' | 'waves' | 'lifeScience' | 'earthScience';
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

// NGSS-aligned 4th grade science questions for Michigan M-STEP
const scienceQuestions = {
  // 4-PS3: Energy (4-PS3-1 to 4-PS3-4)
  energy: [
    // 4-PS3-1: Speed and energy relationship
    { question: 'A bowling ball moving faster has more what?', answer: 'energy', options: ['energy', 'color', 'weight', 'size'] },
    { question: 'What happens to a car\'s energy when it slows down?', answer: 'energy transfers to other forms', options: ['energy transfers to other forms', 'energy disappears', 'energy stays the same', 'energy increases'] },
    { question: 'Which rolling ball has more energy: fast or slow?', answer: 'fast ball', options: ['fast ball', 'slow ball', 'both have same energy', 'neither has energy'] },

    // 4-PS3-2: Energy transfer (sound, light, heat, electric currents)
    { question: 'What carries energy from the Sun to Earth?', answer: 'light', options: ['light', 'wind', 'water', 'rocks'] },
    { question: 'How does a lamp transfer electrical energy?', answer: 'into light and heat', options: ['into light and heat', 'into sound only', 'into motion only', 'energy stays as electricity'] },
    { question: 'What form of energy does a bell transfer when it rings?', answer: 'sound', options: ['sound', 'light', 'electricity', 'chemical'] },
    { question: 'A toaster changes electrical energy into what?', answer: 'heat', options: ['heat', 'sound', 'motion', 'light only'] },
    { question: 'Which can transfer energy over a distance?', answer: 'sound, light, and heat', options: ['sound, light, and heat', 'only touch', 'only smell', 'only taste'] },

    // 4-PS3-3: Energy in collisions
    { question: 'What happens when two objects collide?', answer: 'energy transfers between them', options: ['energy transfers between them', 'energy disappears', 'nothing happens', 'both stop moving'] },
    { question: 'A moving ball hits a still ball. What happens to energy?', answer: 'energy moves to the still ball', options: ['energy moves to the still ball', 'energy vanishes', 'energy goes backward', 'both balls lose energy'] },
    { question: 'Why do bumper cars bounce when they crash?', answer: 'energy transfers during collision', options: ['energy transfers during collision', 'magic', 'they are magnetic', 'wind pushes them'] },

    // 4-PS3-4: Energy conversion devices
    { question: 'What does a wind turbine convert wind energy into?', answer: 'electrical energy', options: ['electrical energy', 'sound energy', 'light energy', 'heat energy'] },
    { question: 'What device converts electrical energy into motion?', answer: 'electric motor', options: ['electric motor', 'battery', 'light bulb', 'speaker'] },
    { question: 'Solar panels convert light energy into what?', answer: 'electrical energy', options: ['electrical energy', 'sound energy', 'wind energy', 'water energy'] },
  ],

  // 4-PS4: Waves (4-PS4-1 to 4-PS4-3)
  waves: [
    // 4-PS4-1: Wave properties (amplitude, wavelength)
    { question: 'What makes a sound louder?', answer: 'larger wave amplitude', options: ['larger wave amplitude', 'smaller wave amplitude', 'wave color', 'wave smell'] },
    { question: 'The distance between wave peaks is called what?', answer: 'wavelength', options: ['wavelength', 'amplitude', 'frequency', 'speed'] },
    { question: 'A bigger water wave has more what?', answer: 'amplitude', options: ['amplitude', 'color', 'wetness', 'salt'] },
    { question: 'What property of waves affects how high or low a sound is?', answer: 'wavelength (frequency)', options: ['wavelength (frequency)', 'amplitude', 'color', 'temperature'] },
    { question: 'Waves can carry what from one place to another?', answer: 'information and energy', options: ['information and energy', 'only water', 'only air', 'nothing'] },

    // 4-PS4-2: Light reflection and vision
    { question: 'Why can you see objects around you?', answer: 'light reflects off them into your eyes', options: ['light reflects off them into your eyes', 'your eyes glow', 'objects make their own light', 'magic'] },
    { question: 'What happens when light hits a mirror?', answer: 'light reflects', options: ['light reflects', 'light stops', 'light disappears', 'light turns to heat'] },
    { question: 'You see the Moon because it does what to sunlight?', answer: 'reflects it', options: ['reflects it', 'makes its own light', 'blocks it', 'absorbs all light'] },
    { question: 'Why can\'t you see in a completely dark room?', answer: 'no light to reflect into eyes', options: ['no light to reflect into eyes', 'your eyes are closed', 'objects become invisible', 'objects disappear'] },

    // 4-PS4-3: Information transfer using waves
    { question: 'How did people send messages using drums in the past?', answer: 'patterns of sound waves', options: ['patterns of sound waves', 'writing on drums', 'drum smell', 'drum color'] },
    { question: 'Morse code uses what to send information?', answer: 'patterns of light or sound', options: ['patterns of light or sound', 'pictures', 'colors', 'smells'] },
    { question: 'How does a phone call carry your voice?', answer: 'sound converted to waves', options: ['sound converted to waves', 'tiny people carry it', 'magic', 'your voice flies through air'] },
  ],

  // 4-LS1: Life Science (4-LS1-1 to 4-LS1-2)
  lifeScience: [
    // 4-LS1-1: Internal/external structures (plants and animals)
    { question: 'What plant structure protects it from being eaten?', answer: 'thorns', options: ['thorns', 'flowers', 'roots', 'seeds'] },
    { question: 'What do plant roots do?', answer: 'absorb water and anchor plant', options: ['absorb water and anchor plant', 'make food', 'attract bees', 'grow flowers'] },
    { question: 'What does a plant stem do?', answer: 'supports plant and moves water', options: ['supports plant and moves water', 'makes seeds', 'attracts insects', 'stores food only'] },
    { question: 'What internal structure pumps blood in animals?', answer: 'heart', options: ['heart', 'lungs', 'stomach', 'brain'] },
    { question: 'What internal structure helps animals think?', answer: 'brain', options: ['brain', 'heart', 'lungs', 'stomach'] },
    { question: 'What body part helps animals breathe air?', answer: 'lungs', options: ['lungs', 'heart', 'brain', 'stomach'] },
    { question: 'Why do some animals have thick fur?', answer: 'to keep them warm', options: ['to keep them warm', 'to look pretty', 'to fly', 'to swim faster'] },
    { question: 'Why do birds have hollow bones?', answer: 'to be lighter for flying', options: ['to be lighter for flying', 'to store food', 'to make sounds', 'to see better'] },

    // 4-LS1-2: Animal senses -> brain processing -> response
    { question: 'When you touch something hot, what happens first?', answer: 'senses send signals to brain', options: ['senses send signals to brain', 'you pull hand away', 'you feel pain', 'you think about it'] },
    { question: 'How does your brain know what you see?', answer: 'eyes send signals to brain', options: ['eyes send signals to brain', 'brain guesses', 'objects tell the brain', 'magic'] },
    { question: 'What processes information from your senses?', answer: 'brain', options: ['brain', 'heart', 'lungs', 'stomach'] },
    { question: 'When a dog hears a loud noise and runs away, what controls this?', answer: 'brain processes sound and responds', options: ['brain processes sound and responds', 'ears make dog run', 'legs decide on their own', 'automatic without brain'] },
  ],

  // 4-ESS: Earth Science (4-ESS1-1, 4-ESS2-1, 4-ESS2-2, 4-ESS3-1, 4-ESS3-2)
  earthScience: [
    // 4-ESS1-1: Rock layers and fossils show landscape changes
    { question: 'What do fossils in rock layers tell us?', answer: 'what lived there long ago', options: ['what lived there long ago', 'tomorrow\'s weather', 'rock color', 'nothing useful'] },
    { question: 'Layers of rock show that Earth\'s surface has done what?', answer: 'changed over time', options: ['changed over time', 'stayed exactly the same', 'appeared yesterday', 'never had water'] },
    { question: 'Finding a fish fossil on a mountain means what?', answer: 'that area was once underwater', options: ['that area was once underwater', 'fish can climb mountains', 'someone put it there', 'nothing'] },
    { question: 'How are rock layers like pages in a history book?', answer: 'each layer shows a different time', options: ['each layer shows a different time', 'they have words', 'they tell stories', 'they don\'t relate'] },

    // 4-ESS2-1: Weathering and erosion effects
    { question: 'What breaks down rocks into smaller pieces over time?', answer: 'weathering', options: ['weathering', 'earthquakes only', 'animals only', 'plants only'] },
    { question: 'What moves weathered rock from one place to another?', answer: 'erosion (water, wind, ice)', options: ['erosion (water, wind, ice)', 'nothing moves rock', 'only humans', 'only earthquakes'] },
    { question: 'How does water change the shape of land over time?', answer: 'erodes and moves soil and rock', options: ['erodes and moves soil and rock', 'water doesn\'t affect land', 'only makes it wet', 'water makes land grow'] },
    { question: 'Wind blowing sand can do what to rocks?', answer: 'wear them down over time', options: ['wear them down over time', 'make them grow', 'change their color only', 'nothing'] },
    { question: 'What can prevent soil erosion on a hillside?', answer: 'plants with roots holding soil', options: ['plants with roots holding soil', 'removing all plants', 'adding more water', 'making it steeper'] },

    // 4-ESS2-2: Mapping Earth features (mountains, volcanoes, earthquakes)
    { question: 'Where do most earthquakes occur?', answer: 'along plate boundaries', options: ['along plate boundaries', 'only in oceans', 'randomly everywhere equally', 'only at the equator'] },
    { question: 'Where are volcanoes most commonly found?', answer: 'along plate boundaries', options: ['along plate boundaries', 'only in deserts', 'only at poles', 'randomly everywhere equally'] },
    { question: 'Mountains often form where what happens?', answer: 'Earth\'s plates push together', options: ['Earth\'s plates push together', 'it rains a lot', 'plants grow tall', 'wind blows hard'] },
    { question: 'Why do scientists map volcanoes and earthquake zones?', answer: 'to identify patterns and risks', options: ['to identify patterns and risks', 'just for fun', 'to count them', 'maps don\'t help'] },

    // 4-ESS3-1: Renewable vs. non-renewable energy, environmental impacts
    { question: 'Which energy source can be replaced naturally?', answer: 'solar and wind (renewable)', options: ['solar and wind (renewable)', 'coal and oil', 'natural gas', 'gasoline'] },
    { question: 'Coal and oil are called what type of resource?', answer: 'non-renewable', options: ['non-renewable', 'renewable', 'infinite', 'unlimited'] },
    { question: 'What is a benefit of using wind energy?', answer: 'doesn\'t pollute air', options: ['doesn\'t pollute air', 'uses up the wind', 'causes earthquakes', 'makes noise pollution'] },
    { question: 'What happens when we burn fossil fuels?', answer: 'releases pollution into air', options: ['releases pollution into air', 'makes air cleaner', 'creates more fuel', 'nothing happens'] },
    { question: 'Which energy source will never run out?', answer: 'sunlight (solar)', options: ['sunlight (solar)', 'coal', 'oil', 'natural gas'] },

    // 4-ESS3-2: Reducing natural hazard impacts
    { question: 'How can buildings be made safer in earthquake areas?', answer: 'flexible design to absorb shaking', options: ['flexible design to absorb shaking', 'make them very tall', 'use only glass', 'build on hills'] },
    { question: 'What helps protect coastal areas from flooding?', answer: 'sea walls and sand dunes', options: ['sea walls and sand dunes', 'removing all sand', 'building close to water', 'cutting down trees'] },
    { question: 'Why do people build levees near rivers?', answer: 'to prevent flood damage', options: ['to prevent flood damage', 'to make water flow faster', 'for decoration', 'to catch fish'] },
    { question: 'What can communities do to prepare for natural hazards?', answer: 'have emergency plans and supplies', options: ['have emergency plans and supplies', 'ignore the risks', 'wait until disaster strikes', 'move away always'] },
  ],
};

const generateQuestion = (level: number): GameQuestion => {
  // Progressive difficulty: introduce topics gradually
  const types: QuestionType[] = ['energy', 'waves'];

  // Add Life Science at level 3+
  if (level >= 3) {
    types.push('lifeScience');
  }

  // Add Earth Science at level 5+ (more complex concepts)
  if (level >= 5) {
    types.push('earthScience');
  }

  const type = types[Math.floor(Math.random() * types.length)];
  const questionBank = scienceQuestions[type];
  const item = questionBank[Math.floor(Math.random() * questionBank.length)];

  return {
    id: `${Date.now()}-${Math.random()}`,
    question: item.question,
    answer: item.answer,
    options: item.options,
    difficulty: level,
  };
};

export const ScienceGame = ({ onBack }: ScienceGameProps) => {
  const { user, saveScore } = useUser();
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('science');
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion>(() =>
    generateQuestion(progress.level)
  );
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
    { type: 'hint', name: 'Explorer\'s Compass', icon: '🧭', description: 'Reveal a hint', cost: 5, count: 3 },
    { type: 'timeFreeze', name: 'Norse Frost', icon: '❄️', description: 'Freeze timer for 10s', cost: 8, count: 2 },
    { type: 'multiplier', name: 'Valhalla Star', icon: '🌟', description: '2x points for 3 questions', cost: 10, count: 1 },
  ]);

  useEffect(() => {
    const newQuestion = generateQuestion(progress.level);
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
    addIncorrectAnswer('science');
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
    const newQuestion = generateQuestion(progress.level);
    setCurrentQuestion(newQuestion);
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
      addCorrectAnswer('science');
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
        createParticles('⚓');
      } else {
        createParticles('⚡');
      }

      if (user) {
        saveScore('science', sessionScore + points, progress.level, progress.totalCorrect + 1, progress.totalAttempts + 1);
      }

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setFeedback('incorrect');
      addIncorrectAnswer('science');
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
    <GameLayout subject="science" progress={progress} onBack={onBack}>
      <div className="science-game adventure-theme">
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
            <span className="quest-icon">🧭</span>
            <span className="quest-title">Viking Discovery Voyage - Level {progress.level}</span>
          </div>
          <div className="resources">
            <div className="resource coins">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{coins}</span>
            </div>
            <div className="resource quests">
              <span className="resource-icon">⚓</span>
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
              🧭 Hint: The answer starts with "{String(currentQuestion.answer)[0]}"
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
                  <span>Norse Discovery! +{Math.floor((10 * progress.level + (streak > 0 ? (streak - 1) * 5 : 0) + Math.floor(timeLeft / 3)) * scoreMultiplier)} points</span>
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
