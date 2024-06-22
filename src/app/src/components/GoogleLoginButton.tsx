import React from 'react';
import { useUser } from './UserContext'; // 確保路徑正確

const GoogleLoginButton: React.FC = () => {
  const { user } = useUser();

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/login';
  };

  return (
    <div>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={user.avatarUrl} alt="User Avatar" style={{ borderRadius: '50%', width: '50px', height: '50px', marginRight: '10px' }} />
          <p>Welcome, {user.name}!</p>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            padding: '10px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

export default GoogleLoginButton;
