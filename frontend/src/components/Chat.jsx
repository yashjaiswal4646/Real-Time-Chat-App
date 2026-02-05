import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import UsersList from './UsersList';
import { FaPaperPlane, FaUsers } from 'react-icons/fa';

const Chat = ({ username, onLeave }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection with Vite environment variable
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);

    // Join chat
    newSocket.emit('join', username);

    // Set up event listeners
    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('messageHistory', (history) => {
      setMessages(history);
    });

    newSocket.on('users', (usersList) => {
      setUsers(usersList);
    });

    newSocket.on('userTyping', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userId);
        if (isTyping) {
          return [...filtered, { userId, username }];
        }
        return filtered;
      });
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [username]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', {
        text: newMessage.trim()
      });
      setNewMessage('');
      
      // Stop typing indicator
      setIsTyping(false);
      socket.emit('typing', false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return 'Several people are typing...';
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2><FaUsers style={{ marginRight: '10px' }} />Chat Room</h2>
        <UsersList users={users} currentUserId={socket?.id} />
        <button 
          onClick={onLeave}
          className="leave-button"
          style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Leave Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h1>Global Chat Room</h1>
          <div className="online-count">
            {users.length} online
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.map(message => (
            <Message
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === socket?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="typing-indicator">
            {getTypingText()}
          </div>
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message here..."
              className="message-input"
              autoFocus
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;