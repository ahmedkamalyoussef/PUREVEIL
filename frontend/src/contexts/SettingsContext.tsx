import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSettingsApi, updateSettingsApi, StoreSettings, DEFAULT_STORE_SETTINGS } from '../services/apiService';
import { getImageUrl } from '../utils/imageUrl';

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  updateSettings: (data: Partial<StoreSettings>) => Promise<StoreSettings>;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_STORE_SETTINGS,
  loading: true,
  updateSettings: async () => DEFAULT_STORE_SETTINGS,
  refetchSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const applyFaviconAndTitle = (s: StoreSettings) => {
    // Dynamically update document title
    if (s.storeName) {
      document.title = `${s.storeName} | Luxury Perfumes & Oud`;
    }

    // Dynamically update favicon link tag
    if (s.favicon) {
      const favUrl = getImageUrl(s.favicon);
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = `${favUrl}?v=${Date.now()}`;
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSettingsApi();
      setSettings(data);
      applyFaviconAndTitle(data);
    } catch (err) {
      console.error('Failed to load settings in provider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateSettings = async (data: Partial<StoreSettings>): Promise<StoreSettings> => {
    const updated = await updateSettingsApi(data);
    setSettings(updated);
    applyFaviconAndTitle(updated);
    return updated;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings: handleUpdateSettings,
        refetchSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
