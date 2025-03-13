import { sendToBackground } from '@plasmohq/messaging';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  llmApiKey: string;
  llmPlatform: string;
  planTier: string;
}

interface Settings {
  options: {
    executeSummariesAfter?: number;
    deleteDataEvery?: number;
    forwardMinkDigestToEmail?: boolean;
    maxAllowedLinksPerDay?: number;
    shouldIgnoreSocialMediaPlatforms?: boolean;
    startTrackingSessionAfter?: number | string;
    ignoredWebsiteList?: string[];
    minkRunFrequency?: string;
  };
}

interface UserContextType {
  user: User | null;
  settings: Settings | null;
  setUser: (user: User) => void;
  logOut: () => void;
  updateSettings: (options: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await sendToBackground({
          name: 'get-user',
          body: {},
        });
        setUser(userResponse.user);
        
        const settingsResponse = await sendToBackground({
          name: 'get-account-settings',
          body: {},
        });
        
        if (settingsResponse.status) {
          setSettings(settingsResponse.settings);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const updateSettings = async (options: any) => {
    try {
      
      // Fix the structure of the options object
      const updatedOptions = options.hasOwnProperty('options') 
        ? options 
        : { options: options };
      
      const response = await sendToBackground({
        name: 'update-account-settings',
        body: updatedOptions.options
      });
            
      if (response.status) {
        // Ensure we maintain the correct structure
        setSettings({
          options: {
            ...(settings?.options || {}),
            ...response.settings
          }
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

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
    <UserContext.Provider value={{ user, settings, setUser, logOut, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
};