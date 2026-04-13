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

    const buttonGroupStyles = `flex gap-1`
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    return (
        <div
            style={{
                transform: viewContext.sidebarActive ? "translateX(0)" : "translateX(100%)",
                transition: prefsContext.playAnimations ? `transform 100ms ease-in-out` : `none`,
            }}
            className="absolute top-0 right-0 h-full w-screen md:w-1/3 lg:w-1/5 z-50 bg-mist-900 dark:bg-black text-white flex flex-col"
            inert={!viewContext.sidebarActive }
        >
            <div className="flex flex-col gap-6 items-start flex-1 w-full p-3 overflow-y-scroll pb-12">
                <h3 className={"text-xl font-bold"}>Options</h3>
                <fieldset className={`${viewContext.view === "game" && `hidden`} md:hidden flex flex-col`}>
                    <legend className={labelStyles} aria-label={"season selector"}>Season</legend>
                    <div id={"sidebarSeasonSwitcher"}>
                        <SeasonSwitcher />
                    </div>
                </fieldset>
                <fieldset className={`flex flex-col`}>
                    <legend className={labelStyles}>
                        Scores for recent games
                    </legend>
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
                <fieldset className={`md:hidden flex flex-col`}>
                    <legend className={labelStyles}>Theme</legend>
                    <div id={"themeSwitcher"} className={buttonGroupStyles}>
                        <button
                            className={`${buttonStyles} ${prefsContext.theme === "light" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.changeTheme("light")}
                        >
                            <MdLightMode aria-hidden={true}/>
                            <span>Light</span>
                        </button>
                        <button
                            className={`${buttonStyles} ${prefsContext.theme === "dark" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.changeTheme("dark")}
                        >
                            <MdDarkMode aria-hidden={true}/>
                            <span>Dark</span>
                        </button>
                    </div>
                </fieldset>
                <fieldset className={`flex flex-col`}>
                    <legend className={labelStyles}>Animations</legend>
                    <div className={buttonGroupStyles}>
                        <button
                            className={`${buttonStyles} ${prefsContext.playAnimations ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.setPlayAnimations(true)}
                        >
                            On
                        </button>
                        <button
                            className={`${buttonStyles} ${!prefsContext.playAnimations ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => prefsContext.setPlayAnimations(false)}
                        >
                            Off
                        </button>
                    </div>
                </fieldset>
                { isTouch &&
                    <fieldset className={`flex flex-col`}>
                        <legend className={labelStyles}>
                            Swipe gestures
                        </legend>
                        <div className={buttonGroupStyles}>
                            <button
                                className={`${prefsContext.gesturePrefs.global ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                onClick={() => {
                                    prefsContext.setGesturePrefs({
                                        ...prefsContext.gesturePrefs,
                                        global: true
                                    })
                                }}
                            >
                                On
                            </button>
                            <button
                                className={`${!prefsContext.gesturePrefs.global ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                onClick={() => {
                                    prefsContext.setGesturePrefs({
                                        ...prefsContext.gesturePrefs,
                                        global: false
                                    })
                                }}
                            >
                                Off
                            </button>
                        </div>
                            { prefsContext.gesturePrefs.global &&
                                <div className={"pl-2 flex flex-col gap-1 mt-2"}>
                                    <fieldset>
                                        <legend className={labelStyles}>Round view</legend>
                                        <div className={buttonGroupStyles}>
                                            <button
                                                className={`${prefsContext.gesturePrefs.round ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        round: true
                                                    })
                                                }}
                                            >
                                                On
                                            </button>
                                            <button
                                                className={`${!prefsContext.gesturePrefs.round ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        round: false
                                                    })
                                                }}
                                            >
                                                Off
                                            </button>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <legend className={labelStyles}>Ladder view</legend>
                                        <div className={`${buttonGroupStyles}`}>
                                            <button
                                                className={`${prefsContext.gesturePrefs.ladder === false ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        ladder: false
                                                    })
                                                }}
                                            >
                                                Off
                                            </button>
                                            <button
                                                className={`${prefsContext.gesturePrefs.ladder === "views" ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        ladder: "views"
                                                    })
                                                }}
                                            >
                                                Views
                                            </button>
                                            <button
                                                className={`${prefsContext.gesturePrefs.ladder === "seasons" ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        ladder: "seasons"
                                                    })
                                                }}
                                            >
                                                Seasons
                                            </button>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <legend className={labelStyles}>Game view</legend>
                                        <div className={buttonGroupStyles}>
                                            <button
                                                className={`${prefsContext.gesturePrefs.game ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        game: true
                                                    })
                                                }}
                                            >
                                                On
                                            </button>
                                            <button
                                                className={`${!prefsContext.gesturePrefs.game ? activeButtonStyles : inactiveButtonStyles} ${buttonStyles} `}
                                                onClick={() => {
                                                    prefsContext.setGesturePrefs({
                                                        ...prefsContext.gesturePrefs,
                                                        game: false
                                                    })
                                                }}
                                            >
                                                Off
                                            </button>
                                        </div>
                                    </fieldset>
                            </div>
                            }
                    </fieldset>
                }
            </div>

            <span
                className={"mt-auto wrap-break-word text-xs text-neutral-700 text-left p-2"}
                aria-label={`app version: ${__COMMIT_HASH__}`}
            >
                app version: {__COMMIT_HASH__}
            </span>
        </div>
    );
}