import { useState, useEffect, useRef } from 'react';
import { GameLayout } from '../../components/game-framework/GameLayout';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import type { GameQuestion } from '../../types/games';
import './ReadingGame.css';

interface ReadingGameProps {
  onBack: () => void;
}

type QuestionType = 'spelling' | 'vocabulary' | 'grammar' | 'comprehension' | 'figurative' | 'roots';
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

// M-STEP aligned 4th grade ELA content
const wordLists = {
  // Enhanced spelling with Greek/Latin roots and multi-syllabic words
  spelling: [
    { word: 'telephone', hint: 'Device to call people', root: 'tele (far) + phone (sound)' },
    { word: 'photograph', hint: 'A picture taken with a camera', root: 'photo (light) + graph (write)' },
    { word: 'biography', hint: 'A story about someone\'s life', root: 'bio (life) + graph (write)' },
    { word: 'geography', hint: 'The study of Earth', root: 'geo (earth) + graph (write)' },
    { word: 'telescope', hint: 'Tool to see far away', root: 'tele (far) + scope (see)' },
    { word: 'autograph', hint: 'Someone\'s signature', root: 'auto (self) + graph (write)' },
    { word: 'microscope', hint: 'Tool to see tiny things', root: 'micro (small) + scope (see)' },
    { word: 'television', hint: 'Device to watch shows', root: 'tele (far) + vision (see)' },
    { word: 'ancient', hint: 'Very old' },
    { word: 'curious', hint: 'Wanting to know' },
    { word: 'excellent', hint: 'Very good' },
    { word: 'fortunate', hint: 'Lucky' },
    { word: 'generous', hint: 'Giving and kind' },
    { word: 'mysterious', hint: 'Hard to understand' },
    { word: 'necessary', hint: 'Needed or required' },
    { word: 'peculiar', hint: 'Strange or odd' },
    { word: 'receive', hint: 'To get something' },
    { word: 'separate', hint: 'To divide or split' },
    { word: 'guarantee', hint: 'A promise' },
    { word: 'restaurant', hint: 'Place to eat meals' },
    { word: 'important', hint: 'Very meaningful' },
    { word: 'impossible', hint: 'Cannot be done' },
    { word: 'misunderstand', hint: 'To get the wrong idea' },
    { word: 'uncomfortable', hint: 'Not feeling good' },
  ],

  // L.4.4, L.4.5, L.4.6 - Context clues, synonyms, academic vocabulary
  vocabulary: [
    { word: 'magnificent', definition: 'Very impressive and beautiful', synonym: 'amazing', options: ['amazing', 'tiny', 'boring', 'simple'] },
    { word: 'courage', definition: 'Bravery in facing danger', synonym: 'bravery', options: ['bravery', 'fear', 'sadness', 'anger'] },
    { word: 'examine', definition: 'To look at something closely and carefully', synonym: 'inspect', options: ['inspect', 'ignore', 'avoid', 'skip'] },
    { word: 'discover', definition: 'To find something for the first time', synonym: 'find', options: ['find', 'lose', 'hide', 'forget'] },
    { word: 'ancient', definition: 'Very old; from long ago', synonym: 'old', options: ['old', 'new', 'young', 'modern'] },
    { word: 'tremendous', definition: 'Very large or great', synonym: 'enormous', options: ['enormous', 'tiny', 'small', 'little'] },
    { word: 'reluctant', definition: 'Not willing to do something', synonym: 'hesitant', options: ['hesitant', 'eager', 'excited', 'ready'] },
    { word: 'anxious', definition: 'Feeling worried or nervous', synonym: 'worried', options: ['worried', 'calm', 'relaxed', 'peaceful'] },
    { word: 'peculiar', definition: 'Strange or unusual', synonym: 'odd', options: ['odd', 'normal', 'common', 'typical'] },
    { word: 'fierce', definition: 'Violent and aggressive', synonym: 'wild', options: ['wild', 'gentle', 'calm', 'peaceful'] },
    { word: 'abundant', definition: 'Existing in large amounts', synonym: 'plentiful', options: ['plentiful', 'scarce', 'rare', 'few'] },
    { word: 'persuade', definition: 'To convince someone to do something', synonym: 'convince', options: ['convince', 'discourage', 'prevent', 'stop'] },
    { word: 'observe', definition: 'To watch carefully', synonym: 'watch', options: ['watch', 'ignore', 'miss', 'overlook'] },
    { word: 'respond', definition: 'To answer or reply', synonym: 'reply', options: ['reply', 'ignore', 'avoid', 'skip'] },
    { word: 'evidence', definition: 'Facts or information that prove something', synonym: 'proof', options: ['proof', 'guess', 'opinion', 'lie'] },
  ],

  // L.4.5 - Figurative language: similes, metaphors, idioms, adages
  figurative: [
    { question: '"Time is money" is an example of what?', answer: 'metaphor', options: ['metaphor', 'simile', 'idiom', 'adage'], explanation: 'It compares two things without using like or as' },
    { question: 'What does "break the ice" mean?', answer: 'start a conversation', options: ['start a conversation', 'actually break ice', 'feel cold', 'play hockey'], explanation: 'An idiom meaning to start talking in an awkward situation' },
    { question: '"She was as busy as a bee" is what type of figurative language?', answer: 'simile', options: ['simile', 'metaphor', 'idiom', 'personification'], explanation: 'Uses "as" to compare' },
    { question: 'What does the idiom "it\'s raining cats and dogs" mean?', answer: 'raining very hard', options: ['raining very hard', 'animals are falling', 'a light rain', 'it stopped raining'], explanation: 'Idiom for heavy rain' },
    { question: '"The early bird catches the worm" is a(n):', answer: 'adage', options: ['adage', 'simile', 'metaphor', 'idiom'], explanation: 'A traditional saying expressing a common truth' },
    { question: '"Her smile was the sun on a cloudy day" is what?', answer: 'metaphor', options: ['metaphor', 'simile', 'idiom', 'adage'], explanation: 'Directly compares her smile to the sun' },
    { question: 'What does "piece of cake" mean?', answer: 'very easy', options: ['very easy', 'a dessert', 'very hard', 'expensive'], explanation: 'Idiom meaning something is simple' },
    { question: '"He runs like the wind" is a:', answer: 'simile', options: ['simile', 'metaphor', 'idiom', 'personification'], explanation: 'Uses "like" to compare' },
    { question: '"Don\'t cry over spilled milk" means:', answer: 'don\'t worry about past mistakes', options: ['don\'t worry about past mistakes', 'clean up messes', 'drink more milk', 'be careful'], explanation: 'Adage about not dwelling on things you can\'t change' },
    { question: '"The classroom was a zoo" is a:', answer: 'metaphor', options: ['metaphor', 'simile', 'personification', 'alliteration'], explanation: 'Compares the classroom to a zoo without using like or as' },
  ],

  // L.4.4.b - Greek and Latin roots and affixes
  roots: [
    { question: 'What does the root "tele" mean in "telephone"?', answer: 'far', options: ['far', 'sound', 'near', 'small'], explanation: 'tele = far or distant' },
    { question: 'What does "graph" mean in "photograph"?', answer: 'write or record', options: ['write or record', 'light', 'picture', 'camera'], explanation: 'graph = to write or draw' },
    { question: 'What does "bio" mean in "biology"?', answer: 'life', options: ['life', 'study', 'animals', 'plants'], explanation: 'bio = life' },
    { question: 'What does "geo" mean in "geography"?', answer: 'earth', options: ['earth', 'map', 'study', 'rocks'], explanation: 'geo = earth' },
    { question: 'In "microscope," what does "micro" mean?', answer: 'small', options: ['small', 'large', 'see', 'view'], explanation: 'micro = very small' },
    { question: 'What does "scope" mean in "telescope"?', answer: 'to see', options: ['to see', 'far', 'near', 'tool'], explanation: 'scope = to look at or see' },
    { question: 'What does "auto" mean in "autobiography"?', answer: 'self', options: ['self', 'life', 'story', 'book'], explanation: 'auto = self' },
    { question: 'In "transport," "port" means:', answer: 'carry', options: ['carry', 'move', 'travel', 'ship'], explanation: 'port = to carry' },
    { question: 'What does the prefix "un-" mean in "unhappy"?', answer: 'not', options: ['not', 'very', 'again', 'before'], explanation: 'un- = not or opposite of' },
    { question: 'What does the prefix "re-" mean in "rewrite"?', answer: 'again', options: ['again', 'not', 'before', 'after'], explanation: 're- = again or back' },
    { question: 'What does "aud" mean in "audience"?', answer: 'hear', options: ['hear', 'see', 'speak', 'watch'], explanation: 'aud = to hear' },
    { question: 'In "predict," "pre" means:', answer: 'before', options: ['before', 'after', 'during', 'again'], explanation: 'pre- = before' },
  ],

  // L.4.1, L.4.2 - Grammar and language conventions
  grammar: [
    // Relative pronouns (L.4.1.a)
    { question: 'The girl _____ won the race is my friend.', answer: 'who', options: ['who', 'which', 'what', 'whom'], explanation: 'Use "who" for people as the subject' },
    { question: 'The book _____ I read was exciting.', answer: 'that', options: ['that', 'who', 'whom', 'where'], explanation: '"That" introduces a clause about things' },
    { question: 'The dog _____ tail is wagging is friendly.', answer: 'whose', options: ['whose', 'who', 'which', 'that'], explanation: '"Whose" shows possession' },
    { question: 'The house _____ we visited was old.', answer: 'that', options: ['that', 'who', 'whom', 'whose'], explanation: '"That" refers to things' },
    { question: 'To _____ did you give the letter?', answer: 'whom', options: ['whom', 'who', 'whose', 'which'], explanation: '"Whom" is used as the object' },

    // Relative adverbs (L.4.1.a)
    { question: 'That is the place _____ we had our picnic.', answer: 'where', options: ['where', 'when', 'why', 'which'], explanation: '"Where" refers to a place' },
    { question: 'Do you remember _____ we first met?', answer: 'when', options: ['when', 'where', 'why', 'how'], explanation: '"When" refers to a time' },
    { question: 'Tell me _____ you are upset.', answer: 'why', options: ['why', 'when', 'where', 'how'], explanation: '"Why" asks for a reason' },

    // Progressive verb tenses (L.4.1.b)
    { question: 'Right now, I _____ my homework.', answer: 'am doing', options: ['am doing', 'was doing', 'will be doing', 'do'], explanation: 'Present progressive for actions happening now' },
    { question: 'Yesterday at 3pm, she _____ her bike.', answer: 'was riding', options: ['was riding', 'is riding', 'will be riding', 'rides'], explanation: 'Past progressive for past ongoing action' },
    { question: 'Tomorrow at this time, we _____ on the beach.', answer: 'will be playing', options: ['will be playing', 'are playing', 'were playing', 'play'], explanation: 'Future progressive for future ongoing action' },
    { question: 'They _____ soccer when it started to rain.', answer: 'were playing', options: ['were playing', 'are playing', 'will be playing', 'played'], explanation: 'Past progressive' },

    // Modal auxiliaries (L.4.1.c)
    { question: '_____ I borrow your pencil?', answer: 'May', options: ['May', 'Must', 'Should', 'Will'], explanation: '"May" asks for permission' },
    { question: 'You _____ finish your work before playing.', answer: 'must', options: ['must', 'may', 'might', 'could'], explanation: '"Must" shows obligation' },
    { question: 'She _____ be late because of traffic.', answer: 'might', options: ['might', 'must', 'shall', 'will'], explanation: '"Might" shows possibility' },
    { question: '_____ you please help me?', answer: 'Can', options: ['Can', 'Must', 'Shall', 'Might'], explanation: '"Can" asks for ability/help' },

    // Commonly confused words (L.4.1.g)
    { question: 'I want _____ go to the park.', answer: 'to', options: ['to', 'too', 'two'], explanation: '"To" shows direction or purpose' },
    { question: 'I want to come _____.', answer: 'too', options: ['too', 'to', 'two'], explanation: '"Too" means also or as well' },
    { question: '_____ going to the movies.', answer: "They're", options: ["They're", 'Their', 'There'], explanation: "\"They're\" = they are" },
    { question: 'Put the book over _____.', answer: 'there', options: ['there', 'their', "they're"], explanation: '"There" refers to a place' },
    { question: 'The dog wagged _____ tail.', answer: 'its', options: ['its', "it's"], explanation: '"Its" shows possession' },
    { question: '_____ a beautiful day!', answer: "It's", options: ["It's", 'Its'], explanation: "\"It's\" = it is" },
    { question: '_____ are my friends.', answer: 'Those', options: ['Those', 'Them', 'They'], explanation: '"Those" is correct as a demonstrative pronoun' },

    // Sentence fragments and run-ons (L.4.1.f)
    { question: 'Which is a complete sentence?', answer: 'The cat sleeps on the couch.', options: ['The cat sleeps on the couch.', 'Sleeping on the couch.', 'The cat on the couch.', 'When the cat sleeps.'], explanation: 'Has subject and predicate' },
    { question: 'Which is a sentence fragment?', answer: 'Running down the street.', options: ['Running down the street.', 'She ran down the street.', 'I was running down the street.', 'They run down the street.'], explanation: 'Missing a subject - who is running?' },

    // Comma usage (L.4.2.c)
    { question: 'Which sentence uses commas correctly?', answer: 'I bought apples, oranges, and bananas.', options: ['I bought apples, oranges, and bananas.', 'I bought apples oranges and bananas.', 'I bought, apples oranges and bananas.', 'I bought apples oranges, and bananas.'], explanation: 'Commas separate items in a list' },
    { question: 'Where does the comma go? "I wanted to play but it was raining."', answer: 'I wanted to play, but it was raining.', options: ['I wanted to play, but it was raining.', 'I wanted, to play but it was raining.', 'I wanted to play but, it was raining.', 'No comma needed'], explanation: 'Comma before coordinating conjunction in compound sentence' },

    // Quotation marks for dialogue (L.4.2.b)
    { question: 'Which shows correct dialogue punctuation?', answer: '"Let\'s go!" she said.', options: ['"Let\'s go!" she said.', '"Lets go" she said.', 'Lets go! she said.', '"Let\'s go! she said."'], explanation: 'Quotation marks around spoken words, punctuation inside' },
  ],

  // RL.4, RI.4 - Reading comprehension with inference
  comprehension: [
    {
      passage: 'Sarah looked out the window at the gray clouds. She sighed and put away her swimming suit.',
      question: 'What can you infer about the weather?',
      answer: 'It\'s going to rain',
      options: ['It\'s going to rain', 'It\'s sunny', 'It\'s snowing', 'It\'s windy'],
      explanation: 'Gray clouds and putting away swimming suit suggest rain'
    },
    {
      passage: 'Tom\'s hands were shaking as he walked onto the stage. His mouth felt dry.',
      question: 'How is Tom feeling?',
      answer: 'nervous',
      options: ['nervous', 'excited', 'angry', 'bored'],
      explanation: 'Shaking hands and dry mouth are signs of nervousness'
    },
    {
      passage: 'First, mix the flour and sugar. Next, add the eggs. Finally, bake for 30 minutes.',
      question: 'What text structure is this?',
      answer: 'chronological order',
      options: ['chronological order', 'cause and effect', 'compare and contrast', 'problem and solution'],
      explanation: 'Uses sequence words: first, next, finally'
    },
    {
      passage: 'Because it rained heavily, the game was canceled.',
      question: 'What text structure is this?',
      answer: 'cause and effect',
      options: ['cause and effect', 'chronological order', 'compare and contrast', 'description'],
      explanation: 'Shows cause (rain) and effect (cancellation)'
    },
    {
      passage: 'Dogs are loyal and friendly. Cats, on the other hand, are independent.',
      question: 'What text structure is this?',
      answer: 'compare and contrast',
      options: ['compare and contrast', 'cause and effect', 'problem and solution', 'description'],
      explanation: 'Compares dogs and cats'
    },
    {
      passage: 'The garden had no water and plants were dying. The farmer installed a new irrigation system.',
      question: 'What text structure is this?',
      answer: 'problem and solution',
      options: ['problem and solution', 'cause and effect', 'compare and contrast', 'chronological order'],
      explanation: 'States problem (no water) and solution (irrigation)'
    },
    {
      passage: 'Maria practiced piano every day for a year. At the recital, she played perfectly.',
      question: 'What is the theme?',
      answer: 'Practice leads to success',
      options: ['Practice leads to success', 'Music is fun', 'Pianos are hard', 'Give up easily'],
      explanation: 'The story shows hard work paying off'
    },
    {
      passage: 'The old key hung on the wall for years. One day, Jake found a locked chest in the attic.',
      question: 'What will likely happen next?',
      answer: 'Jake will try the old key',
      options: ['Jake will try the old key', 'Jake will ignore the chest', 'The key will disappear', 'Jake will leave the attic'],
      explanation: 'The key and locked chest are connected'
    },
  ],
};

const generateQuestion = (level: number, askedQuestions: Set<string> = new Set()): GameQuestion => {
  // Progressive difficulty scaling - introduce new question types as level increases
  const types: QuestionType[] = ['spelling', 'vocabulary'];

  // Level 2+: Add Greek/Latin roots
  if (level >= 2) {
    types.push('roots');
  }

  // Level 3+: Add grammar
  if (level >= 3) {
    types.push('grammar');
  }

  // Level 4+: Add figurative language
  if (level >= 4) {
    types.push('figurative');
  }

  // Level 5+: Add reading comprehension
  if (level >= 5) {
    types.push('comprehension');
  }

  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'spelling': {
      // Filter out already asked spelling questions
      const availableItems = wordLists.spelling.filter(item => !askedQuestions.has(`spelling-${item.word}`));

      // If all spelling questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.spelling;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `spelling-${item.word}`,
        question: `Spell this word: "${item.hint}"`,
        answer: item.word,
        options: generateSpellingOptions(item.word),
        difficulty: level,
      };
    }

    case 'vocabulary': {
      // Filter out already asked vocabulary questions
      const availableItems = wordLists.vocabulary.filter(item => !askedQuestions.has(`vocabulary-${item.word}`));

      // If all vocabulary questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.vocabulary;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `vocabulary-${item.word}`,
        question: `What word means: ${item.definition}?`,
        answer: item.word,
        options: [item.word, ...item.options.slice(0, 3)].sort(() => Math.random() - 0.5),
        difficulty: level,
      };
    }

    case 'roots': {
      // Filter out already asked roots questions
      const availableItems = wordLists.roots.filter(item => !askedQuestions.has(`roots-${item.question}`));

      // If all roots questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.roots;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `roots-${item.question}`,
        question: item.question,
        answer: item.answer,
        options: item.options,
        difficulty: level,
      };
    }

    case 'figurative': {
      // Filter out already asked figurative language questions
      const availableItems = wordLists.figurative.filter(item => !askedQuestions.has(`figurative-${item.question}`));

      // If all figurative questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.figurative;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `figurative-${item.question}`,
        question: item.question,
        answer: item.answer,
        options: item.options,
        difficulty: level,
      };
    }

    case 'grammar': {
      // Filter out already asked grammar questions
      const availableItems = wordLists.grammar.filter(item => !askedQuestions.has(`grammar-${item.question}`));

      // If all grammar questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.grammar;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `grammar-${item.question}`,
        question: item.question,
        answer: item.answer,
        options: item.options,
        difficulty: level,
      };
    }

    case 'comprehension': {
      // Filter out already asked comprehension questions
      const availableItems = wordLists.comprehension.filter(item => !askedQuestions.has(`comprehension-${item.question}`));

      // If all comprehension questions have been asked, reset by using full list
      const itemsToUse = availableItems.length > 0 ? availableItems : wordLists.comprehension;
      const item = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];

      return {
        id: `comprehension-${item.question}`,
        question: item.passage ? `${item.passage}\n\n${item.question}` : item.question,
        answer: item.answer,
        options: item.options,
        difficulty: level,
      };
    }

    default:
      return generateQuestion(level, askedQuestions);
  }
};

const generateSpellingOptions = (correctWord: string): string[] => {
  // Generate common misspellings
  const options = [correctWord];
  const variations = [
    correctWord.replace(/e/g, 'a'),  // vowel swap
    correctWord.replace(/i/g, 'e'),  // vowel swap
    correctWord.slice(0, -1) + (correctWord.slice(-1) === 'e' ? '' : 'e'),  // add/remove e
    correctWord.replace(/c/g, 's'),  // consonant swap
  ].filter(v => v !== correctWord && v.length > 2);

  // Add variations until we have 4 options
  while (options.length < 4 && variations.length > 0) {
    const variation = variations[Math.floor(Math.random() * variations.length)];
    if (!options.includes(variation)) {
      options.push(variation);
    }
    variations.splice(variations.indexOf(variation), 1);
  }

  // If we still need more options, create random variations
  while (options.length < 4) {
    const chars = correctWord.split('');
    const idx = Math.floor(Math.random() * chars.length);
    chars[idx] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const variation = chars.join('');
    if (!options.includes(variation)) {
      options.push(variation);
    }
  }

  return options.sort(() => Math.random() - 0.5);
};

export const ReadingGame = ({ onBack }: ReadingGameProps) => {
  const { user, saveScore } = useUser();
  const { getSubjectProgress, addCorrectAnswer, addIncorrectAnswer } = useProgress();
  const progress = getSubjectProgress('reading');
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
  const [gameMode, setGameMode] = useState<GameMode>('multipleChoice');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: 'hint', name: 'Magic Quill', icon: '🪶', description: 'Reveal a hint', cost: 5, count: 3 },
    { type: 'timeFreeze', name: 'Hourglass', icon: '⏳', description: 'Freeze timer for 10s', cost: 8, count: 2 },
    { type: 'multiplier', name: 'Wisdom Scroll', icon: '📖', description: '2x points for 3 questions', cost: 10, count: 1 },
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
    addIncorrectAnswer('reading');
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
      addCorrectAnswer('reading');
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
        createParticles('📚');
      } else {
        createParticles('⭐');
      }

      if (user) {
        saveScore('reading', sessionScore + points, progress.level, progress.totalCorrect + 1, progress.totalAttempts + 1);
      }

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setFeedback('incorrect');
      addIncorrectAnswer('reading');
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
    handleAnswer(userAnswer);
  };

  const handleMultipleChoice = (option: string) => {
    if (feedback !== null) return;
    setUserAnswer(option);
    handleAnswer(option);
  };

  return (
    <GameLayout subject="reading" progress={progress} onBack={onBack}>
      <div className="reading-game adventure-theme">
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
            <span className="quest-icon">📖</span>
            <span className="quest-title">Reading Quest - Level {progress.level}</span>
          </div>
          <div className="resources">
            <div className="resource coins">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{coins}</span>
            </div>
            <div className="resource quests">
              <span className="resource-icon">📚</span>
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
          </div>

          {showHint && (
            <div className="hint-box">
              🪶 Hint: The answer starts with "{String(currentQuestion.answer)[0]}"
            </div>
          )}

          {gameMode === 'input' ? (
            <form onSubmit={handleSubmit} className="answer-form">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={`answer-input ${feedback ? feedback : ''}`}
                placeholder="Type your answer..."
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
