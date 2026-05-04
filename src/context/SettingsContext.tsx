import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
  storeTitle: string;
  storeImage: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: { storeTitle: 'SNSB World', storeImage: '' },
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({ storeTitle: 'SNSB World', storeImage: '' });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/settings`);
      const data = await res.json();
      if (data.storeTitle) {
        setSettings({
          storeTitle: data.storeTitle,
          storeImage: data.storeImage || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
