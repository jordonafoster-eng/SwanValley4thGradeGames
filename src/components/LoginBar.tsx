import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './LoginBar.css';

export function LoginBar() {
  const { user, login, logout } = useUser();
  const [username, setUsername] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
      setUsername('');
    }
  };

  if (user) {
    return (
      <div className="login-bar logged-in">
        <span className="welcome-text">Welcome, {user.username}!</span>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="login-bar">
      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="username" className="login-label">
          Enter your name:
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          className="login-input"
          maxLength={20}
        />
        <button type="submit" className="login-button" disabled={!username.trim()}>
          Start Playing
        </button>
      </form>
    </div>
  );
}
