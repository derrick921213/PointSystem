import React, { useState, useEffect } from "react";
import { useUser, UserProvider } from "@site/src/components/UserContext"; // Adjust the import path as necessary

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log(user);
        // window.location.href = `${window.location.protocol}//${window.location.hostname}:8000/auth/login/`;
      } else {
        console.log(user);
        setIsLoggedIn(true);
      }
    }
  }, [loading, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // if (isLoggedIn) {
  //   return null; // Optionally, you can return a loading spinner or some placeholder
  // }

  return <>{children}</>;
};

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <Root>{children}</Root>
    </UserProvider>
  );
};

export default App;
