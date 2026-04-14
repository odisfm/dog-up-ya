import {createContext, type ReactNode, useEffect, useState} from "react";

type Theme = "light" | "dark";

type GesturePrefType = {
    global: boolean
    round: boolean
    ladder: false | "seasons" | "views"
    game: boolean
}


type PrefsContextType = {
    toggleTheme: () => void;
    changeTheme: (theme: Theme) => void;
    setShowSpoilersPref: (pref: boolean) => void;
    showSpoilers: boolean
    theme: Theme
    addSpoilerIgnoredGame: (gameId: string) => void
    spoilerIgnoredGames: string[]
    playAnimations: boolean
    setPlayAnimations: (setting: boolean) => void
    gesturePrefs: GesturePrefType
    setGesturePrefs: (prefs: GesturePrefType) => void
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
    const [spoilerIgnoredGames, setSpoilerIgnoredGames] = useState((): string[] => {
        const stored = localStorage.getItem("spoilerIgnoredGames");
        if (stored === null) {
            return []
        } else {
            return JSON.parse(stored);
        }
    })
    const [playAnimations, setPlayAnimations] = useState(() => {
        const pref = localStorage.getItem("animationPref");
        if (pref === null) {
            localStorage.setItem("animationPref", "true");
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

    const [gesturePrefs, setGesturePrefs] = useState<GesturePrefType>(() => {
        const pref = localStorage.getItem("gesturePrefs")
        let gesturePrefs: GesturePrefType
        if (pref) {
            gesturePrefs = JSON.parse(pref)
        } else {
            gesturePrefs = {global: true, round: true, ladder: "views", game: false}
            localStorage.setItem("gesturePrefs", JSON.stringify(gesturePrefs))
        }
        return gesturePrefs
    })

    function changeTheme(theme: Theme) {
        localStorage.setItem("darkModePref", theme === "dark" ? "true" : "false");
        document.documentElement.classList.toggle("dark", theme === "dark");
        setTheme(theme);
        umami.track("prefsTheme", theme);
    }

    function toggleTheme() {
        changeTheme(theme === "dark" ? "light" : "dark");
    }

    function setShowSpoilersPref(pref: boolean) {
        setShowSpoilers(pref);
        localStorage.setItem("spoilerPref", pref ? "true" : "false");
        umami.track("prefsSpoiler", pref)
    }

    function addSpoilerIgnoredGame(gameId: string) {
        const ignoredGames = [...spoilerIgnoredGames, gameId];
        localStorage.setItem("spoilerIgnoredGames", JSON.stringify(ignoredGames));
        setSpoilerIgnoredGames(ignoredGames);
    }

    function doSetPlayAnimations(setting: boolean) {
        setPlayAnimations(setting);
        localStorage.setItem("animationPref", String(setting))
        umami.track("prefsAnimations", setting)
    }

    function doSetGesturePrefs(prefs: GesturePrefType) {
        localStorage.setItem("gesturePrefs", JSON.stringify(prefs))
        setGesturePrefs(prefs)
        umami.track("prefsGestures", prefs)
    }

    useEffect(() => {
        if (playAnimations) {
            document.documentElement.classList.remove("no-animate")
        } else {
            document.documentElement.classList.add("no-animate")
        }
    }, [playAnimations])

    return (
        <PrefsContext.Provider value={{
            changeTheme,
            toggleTheme,
            setShowSpoilersPref,
            showSpoilers,
            theme,
            addSpoilerIgnoredGame,
            spoilerIgnoredGames,
            playAnimations,
            setPlayAnimations: doSetPlayAnimations,
            gesturePrefs,
            setGesturePrefs: doSetGesturePrefs,
        }}>
            {children}
        </PrefsContext.Provider>
    )
}