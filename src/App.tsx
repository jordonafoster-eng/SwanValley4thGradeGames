import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { MathGame } from './games/math/MathGame';
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
      case 'science':
      case 'logic':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #5B2C6F 0%, #4B0082 100%)' }}>
            <h2 style={{ color: '#FFD700', fontSize: '2.5rem', marginTop: '4rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>Coming Soon!</h2>
            <p style={{ color: 'white', fontSize: '1.2rem' }}>This game is under development.</p>
            <button
              onClick={handleBackToHome}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                cursor: 'pointer',
                borderRadius: '8px',
                border: '2px solid #FFD700',
                background: 'white',
                color: '#4B0082',
                marginTop: '1rem',
                fontWeight: 'bold',
              }}
            >
              Back to Home
            </button>
          </div>
        );
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
