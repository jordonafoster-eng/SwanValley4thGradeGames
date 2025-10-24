import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { MathGame } from './games/math/MathGame';
import { ReadingGame } from './games/reading/ReadingGame';
import { ScienceGame } from './games/science/ScienceGame';
import { LogicGame } from './games/logic/LogicGame';
import type { Subject } from './types/games';
import './App.css';

type View = 'home' | 'leaderboard' | Subject;

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const handleSelectSubject = (subject: Subject) => {
    setCurrentView(subject);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleViewLeaderboard = () => {
    setCurrentView('leaderboard');
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onSelectSubject={handleSelectSubject}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
      case 'leaderboard':
        return <LeaderboardPage onBack={handleBackToHome} />;
      case 'math':
        return <MathGame onBack={handleBackToHome} />;
      case 'reading':
        return <ReadingGame onBack={handleBackToHome} />;
      case 'science':
        return <ScienceGame onBack={handleBackToHome} />;
      case 'logic':
        return <LogicGame onBack={handleBackToHome} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {renderView()}
    </div>
  );
}

export default App;
