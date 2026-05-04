import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SettingsContextType {
  storeTitle: string;
  storeImage: string;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  storeTitle: 'SNSB World',
  storeImage: '',
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeTitle, setStoreTitle] = useState('SNSB World');
  const [storeImage, setStoreImage] = useState('');

  const refreshSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.storeTitle) setStoreTitle(data.storeTitle);
      if (data.storeImage) setStoreImage(data.storeImage);
    } catch {
      // Settings endpoint not ready yet — use defaults silently
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ storeTitle, storeImage, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);