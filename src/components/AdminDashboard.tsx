import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { SubjectProgress } from '../types/games';
import './AdminDashboard.css';

interface AdminDashboardProps {
  onBack: () => void;
}

interface UserScore {
  username: string;
  subject: string;
  score: number;
  level: number;
  totalCorrect: number;
  totalAttempts: number;
  timestamp: number;
}

interface UserProgressData {
  username: string;
  progress: SubjectProgress;
}

const STORAGE_KEY_PREFIX = 'he4g_progress_';
const SCORES_STORAGE_KEY = 'he4g_all_scores';

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { logout } = useAdmin();
  const [users, setUsers] = useState<UserProgressData[]>([]);
  const [scores, setScores] = useState<UserScore[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const loadData = () => {
    // Load all user progress
    const userProgressList: UserProgressData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const username = key.replace(STORAGE_KEY_PREFIX, '');
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const progress = JSON.parse(data);
            userProgressList.push({ username, progress });
          } catch (e) {
            console.error('Error parsing progress data:', e);
          }
        }
      }
    }
    setUsers(userProgressList);

    // Load all scores
    const scoresData = localStorage.getItem(SCORES_STORAGE_KEY);
    if (scoresData) {
      try {
        const parsedScores = JSON.parse(scoresData);
        setScores(parsedScores);
      } catch (e) {
        console.error('Error parsing scores data:', e);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = (username: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete user "${username}"?\n\n` +
      'This will remove:\n' +
      '• All progress data\n' +
      '• All scores for this user\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmed) return;

    // Delete progress data
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${username}`);

    // Delete scores for this user
    const remainingScores = scores.filter(s => s.username !== username);
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(remainingScores));

    // Reload data
    loadData();
    setSelectedUser(null);
  };

  const handleClearAllData = () => {
    const confirmed = confirm(
      '⚠️ DANGER: Clear ALL Data?\n\n' +
      'This will permanently delete:\n' +
      '• ALL user progress\n' +
      '• ALL leaderboard scores\n' +
      '• ALL game data\n\n' +
      'This action CANNOT be undone!'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      '⚠️ FINAL CONFIRMATION\n\n' +
      'Click OK to permanently delete ALL game data.\n' +
      'Click Cancel to keep the data.'
    );

    if (!doubleConfirm) return;

    // Delete all progress keys
    users.forEach(user => {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${user.username}`);
    });

    // Delete all scores
    localStorage.removeItem(SCORES_STORAGE_KEY);

    // Reload data
    loadData();
    setSelectedUser(null);

    alert('✅ All data has been cleared successfully!');
  };

  const handleLogout = () => {
    logout();
    onBack();
  };

  const getUserScores = (username: string) => {
    return scores.filter(s => s.username === username);
  };

  const getSubjectProgress = (username: string, subject: string) => {
    const user = users.find(u => u.username === username);
    if (!user) return null;
    return user.progress[subject as keyof SubjectProgress];
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header-bar">
        <div className="header-left">
          <h1>🛡️ Admin Dashboard</h1>
          <p className="subtitle">Viking Games Administration</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{scores.length}</div>
              <div className="stat-label">Total Scores</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleClearAllData} className="danger-button">
            🗑️ Clear All Data
          </button>
          <button onClick={loadData} className="refresh-button">
            🔄 Refresh Data
          </button>
        </div>

        <div className="users-section">
          <h2>Users & Progress</h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div
                  key={user.username}
                  className={`user-card ${selectedUser === user.username ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(selectedUser === user.username ? null : user.username)}
                >
                  <div className="user-header">
                    <h3>👤 {user.username}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.username);
                      }}
                      className="delete-user-button"
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="user-stats-grid">
                    {(['math', 'reading', 'science', 'logic'] as const).map((subject) => {
                      const progress = getSubjectProgress(user.username, subject);
                      return (
                        <div key={subject} className="subject-stat">
                          <div className="subject-name">{subject}</div>
                          <div className="subject-level">Level {progress?.level || 1}</div>
                          <div className="subject-accuracy">
                            {progress && progress.totalAttempts > 0
                              ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
                              : 0}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedUser === user.username && (
                    <div className="user-details">
                      <h4>Detailed Progress</h4>
                      {(['math', 'reading', 'science', 'logic'] as const).map((subject) => {
                        const progress = getSubjectProgress(user.username, subject);
                        return (
                          <div key={subject} className="subject-detail">
                            <div className="subject-detail-header">{subject.toUpperCase()}</div>
                            <div className="detail-row">
                              <span>Level:</span>
                              <span>{progress?.level || 1}</span>
                            </div>
                            <div className="detail-row">
                              <span>EXP:</span>
                              <span>{progress?.exp || 0} / {progress?.expToNextLevel || 10}</span>
                            </div>
                            <div className="detail-row">
                              <span>Correct:</span>
                              <span>{progress?.totalCorrect || 0}</span>
                            </div>
                            <div className="detail-row">
                              <span>Attempts:</span>
                              <span>{progress?.totalAttempts || 0}</span>
                            </div>
                          </div>
                        );
                      })}

                      <h4>High Scores</h4>
                      {getUserScores(user.username).length === 0 ? (
                        <p className="no-scores">No scores recorded</p>
                      ) : (
                        <div className="scores-list">
                          {getUserScores(user.username)
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)
                            .map((score, idx) => (
                              <div key={idx} className="score-item">
                                <span className="score-subject">{score.subject}</span>
                                <span className="score-value">{score.score}</span>
                                <span className="score-date">
                                  {new Date(score.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
