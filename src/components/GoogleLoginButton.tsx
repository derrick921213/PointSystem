import React from 'react';

const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/login'; // 替換為您的後端登錄端點
  };

  return (
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
  );
};

export default GoogleLoginButton;
