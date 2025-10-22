import { Leaderboard } from './Leaderboard';
import './LeaderboardPage.css';

interface LeaderboardPageProps {
  onBack: () => void;
}

export function LeaderboardPage({ onBack }: LeaderboardPageProps) {
  return (
    <div className="leaderboard-page">
      <header className="leaderboard-page-header">
        <button onClick={onBack} className="back-button">
          ← Back to Games
        </button>
        <h1>🏆 Hall of Fame</h1>
      </header>
      <div className="leaderboard-page-content">
        <Leaderboard />
      </div>
    </div>
  );
}
