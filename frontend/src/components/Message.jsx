import React from 'react';
import { FaUser } from 'react-icons/fa';

const Message = ({ message, isCurrentUser }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.isSystem) {
    return (
      <div className="message system">
        <span className="message-text">{message.text}</span>
      </div>
    );
  }

  const messageClass = isCurrentUser ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      {!isCurrentUser && (
        <div className="message-sender">
          <FaUser size={12} style={{ marginRight: '8px' }} />
          {message.sender}
        </div>
      )}
      <div className="message-text">{message.text}</div>
      <div className="message-time">{formatTime(message.timestamp)}</div>
    </div>
  );
};

export default Message;