"use client";

import { createContext, useContext } from "react";

type Theme = "dark";

const ThemeContext = createContext({
  theme: "dark" as Theme,
  toggleTheme: () => {},
  setTheme: (_theme: Theme) => {},
});

export function useTheme() { return useContext(ThemeContext); }

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='dark'" }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {}, setTheme: () => {} }}>{children}</ThemeContext.Provider>;
}
