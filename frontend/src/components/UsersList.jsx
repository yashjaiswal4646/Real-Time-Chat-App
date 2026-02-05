import React from 'react';
import { FaUser } from 'react-icons/fa';

const UsersList = ({ users, currentUserId }) => {
  return (
    <div className="users-list">
      <h3>Online Users ({users.length})</h3>
      <div className="users-container">
        {users.map(user => (
          <div 
            key={user.id} 
            className={`user-item ${user.id === currentUserId ? 'current-user' : ''}`}
          >
            <div className="user-status"></div>
            <div className="user-name">
              {user.username}
              {user.id === currentUserId && ' (You)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;