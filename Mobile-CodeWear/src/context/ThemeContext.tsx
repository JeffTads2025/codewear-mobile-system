import React, { createContext, ReactNode, useContext, useState } from 'react';

type ThemeContextValue = { isDark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue>({ isDark: true, toggleTheme: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  return <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark((current) => !current) }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
