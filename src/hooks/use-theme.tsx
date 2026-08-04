import { useEffect, useState, createContext, useContext, type ReactNode } from "react";

type Theme = "light" | "dark";
const KEY = "sds-theme";

type Ctx = {
  theme: Theme;
  toggleTheme: () => void;
  bigFont: boolean;
  toggleBigFont: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [bigFont, setBigFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* preferência de tema indisponível */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("big-font", bigFont);
    root.classList.toggle("high-contrast", highContrast);
  }, [theme, bigFont, highContrast]);

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        toggleTheme: () => {
          setTheme((t) => {
            const next = t === "dark" ? "light" : "dark";
            try {
              localStorage.setItem(KEY, next);
            } catch {
              /* ignore */
            }
            return next;
          });
        },
        bigFont,
        toggleBigFont: () => setBigFont((v) => !v),
        highContrast,
        toggleHighContrast: () => setHighContrast((v) => !v),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme precisa estar dentro de ThemeProvider");
  return c;
}
