import { sendToBackground } from '@plasmohq/messaging';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  llmApiKey: string;
  llmPlatform: string;
  planTier: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await sendToBackground({
          name: 'get-user',
          body: {},
        });
        setUser(response.user);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const logOut = async () => {
    try {
      await sendToBackground({
        name: 'logout-user',
        body: {},
      });
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, logOut }}>
      {children}
    </UserContext.Provider>
  );
};