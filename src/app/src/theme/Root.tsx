import React, { useState, useEffect } from "react";
import { useUser, UserProvider } from "@site/src/components/UserContext";
import GoogleLoginButton from "@site/src/components/GoogleLoginButton";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./root.module.css";

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setIsLoggedIn(true);
      }
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <Heading as="h1" className="hero__title">
            請先登入
          </Heading>
          <GoogleLoginButton></GoogleLoginButton>
        </div>
      </header>
    );
  }

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
