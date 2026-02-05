import React, { useState } from 'react';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    setJoined(true);
  };

  const handleLeave = () => {
    setJoined(false);
    setUsername('');
  };

  if (joined) {
    return (
      <div className="app-container">
        <Chat username={username} onLeave={handleLeave} />
      </div>
    );
  }

  return (
    <div className="join-screen">
      <div className="join-card">
        <h1>💬 Real-Time Chat</h1>
        <p>Join the conversation instantly with users worldwide</p>
        
        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter your username"
            className="username-input"
            autoFocus
          />
          
          {error && (
            <div style={{
              color: '#e53e3e',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button type="submit" className="join-button">
            Join Chat Room
          </button>
        </form>
        
        <div style={{
          marginTop: '30px',
          color: '#718096',
          fontSize: '14px'
        }}>
          <p>Features:</p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            textAlign: 'left',
            display: 'inline-block'
          }}>
            <li>✅ Real-time messaging</li>
            <li>✅ Typing indicators</li>
            <li>✅ Online user list</li>
            <li>✅ Message history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;