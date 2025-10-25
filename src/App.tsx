import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { MathGame } from './games/math/MathGame';
import { ReadingGame } from './games/reading/ReadingGame';
import { ScienceGame } from './games/science/ScienceGame';
import { LogicGame } from './games/logic/LogicGame';
import { useAdmin } from './contexts/AdminContext';
import type { Subject } from './types/games';
import './App.css';

type View = 'home' | 'leaderboard' | 'admin-login' | 'admin-dashboard' | Subject;

function App() {
  const { isAdmin } = useAdmin();
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

  const handleViewAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('admin-login');
    }
  };

  const handleAdminLoginSuccess = () => {
    setCurrentView('admin-dashboard');
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onSelectSubject={handleSelectSubject}
            onViewLeaderboard={handleViewLeaderboard}
            onViewAdmin={handleViewAdmin}
          />
        );
      case 'leaderboard':
        return <LeaderboardPage onBack={handleBackToHome} />;
      case 'admin-login':
        return (
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={handleBackToHome}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard onBack={handleBackToHome} />;
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
