import {createContext, type ReactNode, useState} from "react";

type Theme = "light" | "dark";

type PrefsContextType = {
    toggleTheme: () => void;
    changeTheme: (theme: Theme) => void;
    setShowSpoilersPref: (pref: boolean) => void;
    showSpoilers: boolean
    theme: Theme
}

export const PrefsContext = createContext<PrefsContextType | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
    const [showSpoilers, setShowSpoilers] = useState(() => {
        const pref = localStorage.getItem("spoilerPref");
        if (pref === null) {
            localStorage.setItem("spoilerPref", "true");
            return true;
        }
        return pref === "true";
    });

    const [theme, setTheme] = useState<Theme>(() => {
        const pref = localStorage.getItem("darkModePref");
        const isDark = pref === null || pref === "true";
        if (pref === null) {
            localStorage.setItem("darkModePref", "true");
        }
        document.documentElement.classList.toggle("dark", isDark);
        return isDark ? "dark" : "light";
    });

    function changeTheme(theme: Theme) {
        localStorage.setItem("darkModePref", theme === "dark" ? "true" : "false");
        document.documentElement.classList.toggle("dark", theme === "dark");
        setTheme(theme);
    }

    function toggleTheme() {
        changeTheme(theme === "dark" ? "light" : "dark");
    }

    function setShowSpoilersPref(pref: boolean) {
        setShowSpoilers(pref);
        localStorage.setItem("spoilerPref", pref ? "true" : "false");
    }

    return (
        <PrefsContext.Provider value={{ changeTheme, toggleTheme, setShowSpoilersPref, showSpoilers, theme }}>
            {children}
        </PrefsContext.Provider>
    )
}