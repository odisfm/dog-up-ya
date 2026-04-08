import SeasonSwitcher from "./buttons/SeasonSwitcher.tsx";
import {ViewContext} from "../contexts/ViewProvider.tsx";
import {useContext, useEffect} from "react";
import {PrefsContext} from "../contexts/PrefsProvider.tsx";
import {MdLightMode, MdDarkMode} from "react-icons/md";

export default function Sidebar() {
    const viewContext = useContext(ViewContext)!;
    const prefsContext = useContext(PrefsContext)!;

    const labelStyles = `text-left font-bold mb-2`
    const buttonStyles = `rounded-md px-4 py-1 font-bold cursor-pointer flex gap-2 items-center`
    const inactiveButtonStyles = `bg-mist-700 hover:bg-mist-600`
    const activeButtonStyles = `bg-cyan-700 hover:bg-cyan-700`

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewContext.sidebarActive) {
                if (e.key === "Escape") {
                    viewContext.setSidebarActive(false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown); // cleanup
    }, [viewContext]);

    return (
        <div
            style={{
                transform: viewContext.sidebarActive ? "translateX(0)" : "translateX(100%)",
                transition: "transform 100ms ease-in-out",
            }}
            className="absolute top-0 right-0 h-full w-screen md:w-1/3 lg:w-1/5 z-50 bg-mist-900 dark:bg-black text-white flex flex-col"
        >
            <div className="flex flex-col gap-6 items-start flex-1 w-full p-3 overflow-y-scroll pb-12">
                <h3 className={"text-xl font-bold"}>Options</h3>
                <fieldset className={`md:hidden flex flex-col`}>
                    <label htmlFor={"sidebarSeasonSwitcher"} className={labelStyles}>Season</label>
                    <div id={"sidebarSeasonSwitcher"}>
                        <SeasonSwitcher />
                    </div>
                </fieldset>
                <fieldset className={`md:hidden flex flex-col`}>
                    <label htmlFor={"themeSwitcher"} className={labelStyles}>Theme</label>
                    <div id={"themeSwitcher"} className={"flex gap-1"}>
                        <button
                            className={`${buttonStyles} ${prefsContext.theme === "light" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.changeTheme("light")}
                        >
                            <MdLightMode />
                            <span>Light</span>
                        </button>
                        <button
                            className={`${buttonStyles} ${prefsContext.theme === "dark" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.changeTheme("dark")}
                        >
                            <MdDarkMode />
                            <span>Dark</span>
                        </button>
                    </div>
                </fieldset>
                <fieldset className={`flex flex-col`}>
                    <label htmlFor={"spoilerPreference"} className={labelStyles}>
                        Scores for recent games
                    </label>
                    <div id={"spoilerPreference"} className={"flex gap-1"}>
                        <button
                            className={`${!prefsContext.showSpoilers ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                            onClick={() => prefsContext.setShowSpoilersPref(false)}
                        >
                            Hide
                        </button>
                        <button
                            className={`${prefsContext.showSpoilers ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                            onClick={() => prefsContext.setShowSpoilersPref(true)}
                        >
                            Reveal
                        </button>
                    </div>
                </fieldset>
            </div>
        </div>
    );
}