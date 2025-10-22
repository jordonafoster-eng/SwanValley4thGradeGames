import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MathGame } from './games/math/MathGame';
import type { Subject } from './types/games';
import './App.css';

function App() {
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

  const handleSelectSubject = (subject: Subject) => {
    setCurrentSubject(subject);
  };

  const handleBackToHome = () => {
    setCurrentSubject(null);
  };

  // Render the appropriate game based on selected subject
  const renderGame = () => {
    switch (currentSubject) {
      case 'math':
        return <MathGame onBack={handleBackToHome} />;
      case 'reading':
      case 'science':
      case 'logic':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Coming Soon!</h2>
            <p>This game is under development.</p>
            <button
              onClick={handleBackToHome}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                cursor: 'pointer',
                borderRadius: '8px',
                border: 'none',
                background: '#667eea',
                color: 'white',
                marginTop: '1rem',
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
      {!currentSubject ? (
        <HomePage onSelectSubject={handleSelectSubject} />
      ) : (
        renderGame()
      )}
    </div>
  );
}

export default App;
