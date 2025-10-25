import { useState, useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import './GrammarGame.css';

interface GrammarGameProps {
  onBack: () => void;
}

interface Question {
  question: string;
  answer: string;
  options: string[];
  explanation?: string;
}

// 4th Grade Grammar Rules - M-STEP aligned
const grammarQuestions = {
  sentenceTypes: [
    { question: 'Which is a complete sentence?', answer: 'The dog ran fast.', options: ['The dog ran fast.', 'Running fast', 'The dog running', 'Fast running dog'] },
    { question: 'Which is a declarative sentence?', answer: 'Birds fly south in winter.', options: ['Birds fly south in winter.', 'Do birds fly south?', 'Fly south!', 'What a beautiful bird!'] },
    { question: 'Which is an interrogative sentence?', answer: 'Where are you going?', options: ['Where are you going?', 'Go to school.', 'What a great day!', 'I am going home.'] },
    { question: 'Which is an exclamatory sentence?', answer: 'What an amazing view!', options: ['What an amazing view!', 'The view is nice.', 'Do you like the view?', 'Look at the view.'] },
    { question: 'Which is an imperative sentence?', answer: 'Close the door.', options: ['Close the door.', 'The door is closed.', 'Is the door closed?', 'What a beautiful door!'] },
  ],
  subjectsAndPredicates: [
    { question: 'What is the subject? "The cat climbed the tree."', answer: 'The cat', options: ['The cat', 'climbed', 'the tree', 'climbed the tree'] },
    { question: 'What is the predicate? "My brother plays soccer."', answer: 'plays soccer', options: ['plays soccer', 'My brother', 'brother', 'soccer'] },
    { question: 'What is the complete subject? "The big brown dog barked loudly."', answer: 'The big brown dog', options: ['The big brown dog', 'dog', 'barked loudly', 'brown dog'] },
    { question: 'What is the simple subject? "The tall girl with glasses smiled."', answer: 'girl', options: ['girl', 'The tall girl', 'with glasses', 'smiled'] },
    { question: 'What is the simple predicate? "The students studied hard for the test."', answer: 'studied', options: ['studied', 'students', 'studied hard', 'for the test'] },
  ],
  nounTypes: [
    { question: 'Which is a proper noun?', answer: 'Michigan', options: ['Michigan', 'state', 'city', 'country'] },
    { question: 'Which is a common noun?', answer: 'teacher', options: ['teacher', 'Mrs. Smith', 'Monday', 'Detroit'] },
    { question: 'Which is a collective noun?', answer: 'team', options: ['team', 'player', 'game', 'ball'] },
    { question: 'Which is an abstract noun?', answer: 'happiness', options: ['happiness', 'desk', 'pencil', 'book'] },
    { question: 'Which is a concrete noun?', answer: 'chair', options: ['chair', 'love', 'courage', 'freedom'] },
  ],
  pronouns: [
    { question: 'Which pronoun replaces "Sarah"?', answer: 'she', options: ['she', 'he', 'they', 'it'] },
    { question: 'Which is a possessive pronoun?', answer: 'his', options: ['his', 'he', 'him', 'himself'] },
    { question: 'Which pronoun is plural?', answer: 'they', options: ['they', 'he', 'she', 'it'] },
    { question: 'Choose the correct pronoun: "___ went to the store."', answer: 'I', options: ['I', 'me', 'my', 'mine'] },
    { question: 'Choose the correct pronoun: "The book is ___."', answer: 'mine', options: ['mine', 'my', 'I', 'me'] },
  ],
  verbTenses: [
    { question: 'Which verb is in past tense?', answer: 'walked', options: ['walked', 'walk', 'walking', 'will walk'] },
    { question: 'Which verb is in present tense?', answer: 'runs', options: ['runs', 'ran', 'running', 'will run'] },
    { question: 'Which verb is in future tense?', answer: 'will jump', options: ['will jump', 'jumped', 'jumps', 'jumping'] },
    { question: 'What is the past tense of "eat"?', answer: 'ate', options: ['ate', 'eated', 'eaten', 'eating'] },
    { question: 'What is the past tense of "go"?', answer: 'went', options: ['went', 'goed', 'gone', 'going'] },
    { question: 'What is the past tense of "see"?', answer: 'saw', options: ['saw', 'seed', 'seen', 'seeing'] },
  ],
  adjectivesAndAdverbs: [
    { question: 'Which word is an adjective? "The quick brown fox jumped."', answer: 'quick', options: ['quick', 'jumped', 'fox', 'the'] },
    { question: 'Which word is an adverb? "She ran quickly."', answer: 'quickly', options: ['quickly', 'she', 'ran', 'the'] },
    { question: 'Which word describes HOW something is done?', answer: 'slowly', options: ['slowly', 'tall', 'blue', 'happy'] },
    { question: 'Which word describes a noun?', answer: 'beautiful', options: ['beautiful', 'quickly', 'very', 'tomorrow'] },
    { question: 'Choose the correct form: "This is the ___ day ever!"', answer: 'best', options: ['best', 'good', 'better', 'goodest'] },
  ],
  punctuation: [
    { question: 'Which sentence is punctuated correctly?', answer: 'My birthday is in June.', options: ['My birthday is in June.', 'my birthday is in june.', 'My birthday is in june', 'my Birthday is in June.'] },
    { question: 'Which needs a question mark?', answer: 'Where is your homework', options: ['Where is your homework', 'I finished my homework', 'Complete your homework', 'What amazing homework'] },
    { question: 'Which sentence uses commas correctly?', answer: 'I like apples, oranges, and bananas.', options: ['I like apples, oranges, and bananas.', 'I like apples oranges and bananas.', 'I like, apples oranges and bananas.', 'I like apples oranges, and bananas.'] },
    { question: 'Which greeting is punctuated correctly?', answer: 'Dear Mom,', options: ['Dear Mom,', 'Dear Mom.', 'Dear Mom', 'dear mom,'] },
    { question: 'Which uses an apostrophe correctly?', answer: "Sarah's book", options: ["Sarah's book", "Sarahs book", "Sarahs' book", "Sarah book's"] },
  ],
  capitalization: [
    { question: 'Which word should be capitalized?', answer: 'Monday', options: ['Monday', 'summer', 'school', 'recess'] },
    { question: 'Which is capitalized correctly?', answer: 'Mr. Johnson', options: ['Mr. Johnson', 'mr. Johnson', 'Mr. johnson', 'mr. johnson'] },
    { question: 'Which month should be capitalized?', answer: 'January', options: ['January', 'winter', 'weekend', 'holiday'] },
    { question: 'Which is a proper noun that needs a capital letter?', answer: 'Detroit', options: ['Detroit', 'city', 'street', 'building'] },
  ],
};

type QuestionCategory = keyof typeof grammarQuestions;

export const GrammarGame = ({ onBack }: GrammarGameProps) => {
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('grammar');

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; icon: string }[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [showQuest, setShowQuest] = useState(false);

  const generateQuestion = () => {
    const categories = Object.keys(grammarQuestions) as QuestionCategory[];
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryQuestions = grammarQuestions[randomCategory];
      const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

      const questionId = `${randomCategory}-${randomQuestion.question}`;

      if (!askedQuestions.has(questionId)) {
        setAskedQuestions(prev => new Set([...prev, questionId]));
        setCurrentQuestion(randomQuestion);
        return;
      }
      attempts++;
    }

    // If all questions asked, reset pool
    setAskedQuestions(new Set());
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryQuestions = grammarQuestions[randomCategory];
    const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    setCurrentQuestion(randomQuestion);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

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

  const handleAnswer = (answer: string, event: React.MouseEvent) => {
    if (showFeedback || !currentQuestion) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (correct) {
      addCorrectAnswer('grammar');
      setStreak(prev => prev + 1);
      setCoins(prev => prev + 10);
      createParticles(x, y, '⚡');

      if ((streak + 1) % 5 === 0) {
        setShowQuest(true);
        setTimeout(() => setShowQuest(false), 2000);
      }
    } else {
      addIncorrectAnswer('grammar');
      setStreak(0);
    }

    setQuestionsAnswered(prev => prev + 1);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer('');
      generateQuestion();
    }, 2000);
  };

  const getFeedbackMessage = () => {
    if (!isCorrect) return "Not quite! Try the next one!";

    const messages = [
      "Viking Victory! 🎉",
      "Saga Complete! 📜",
      "Grammar Master! ⚔️",
      "Brilliant! 🌟",
      "Well Done! 🏆"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grammar-game">
      <div className="game-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <h1>📖 Viking Grammar Quest</h1>
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
          🗿 Quest Complete! 5 in a row! +50 Bonus Coins! 🗿
        </div>
      )}

      <div className="game-content">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">Question {questionsAnswered + 1}</span>
          </div>
          <h2 className="question-text">{currentQuestion.question}</h2>

          <div className="answers-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={(e) => handleAnswer(option, e)}
                className={`answer-button ${
                  showFeedback
                    ? option === currentQuestion.answer
                      ? 'correct'
                      : option === selectedAnswer
                      ? 'incorrect'
                      : ''
                    : ''
                }`}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </div>

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
