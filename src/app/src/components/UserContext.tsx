import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

interface UserContextProps {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isLogin = `${window.location.protocol}//${window.location.hostname}:8000/auth/isLogin`;
  const users = `${window.location.protocol}//${window.location.hostname}:8000/auth/user/`;

  useEffect(() => {
    axios
      .get(isLogin, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.is_logged_in) {
          axios
            .get(users, {
              withCredentials: true,
            })
            .then((response) => {
              setUser(response.data);
            })
            .catch((error) =>
              console.error("Error fetching user data:", error)
            );
        } 
      })
      .catch((error) => console.error("Error checking login status:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
