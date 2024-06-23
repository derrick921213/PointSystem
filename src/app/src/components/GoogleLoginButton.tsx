import React from "react";
import { useUser } from "@site/src/components/UserContext"; // 確保路徑正確
import { UserProvider } from "@site/src/components/UserContext";
const GoogleLoginButton: React.FC = () => {
  const { user } = useUser();

  const handleLogin = () => {
    const loginUrl = `${window.location.protocol}//${window.location.hostname}:8000/auth/login`;
    window.location.href = loginUrl;
  };
  const handleLogout = () => {
    const logoutUrl = `${window.location.protocol}//${window.location.hostname}:8000/auth/logout`;
    window.location.href = logoutUrl;
  };

  return (
      <div>
        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={user.avatarUrl}
              alt="User Avatar"
              style={{
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                marginRight: "10px",
              }}
            />
            <p className="text--center" style={{ marginRight: "5px" , marginBottom: "0px"}}>
              Welcome, {user.name}!
            </p>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px",
                backgroundColor: "#4285F4",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              登出
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              padding: "10px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Login with Google
          </button>
        )}
      </div>
  );
};

export default GoogleLoginButton;
