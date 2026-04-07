import {Link, Outlet, useLocation, useNavigate, useParams} from "react-router";
import { MdLightMode } from "react-icons/md"
import {useEffect, useState} from "react";
import {APP_NAME} from "./consts.ts";
import { LiaFootballBallSolid } from "react-icons/lia";
import RoundLadderSwitcher from "./components/buttons/RoundLadderSwitcher.tsx";
import Sidebar from "./components/Sidebar.tsx";
import {GiHamburgerMenu} from "react-icons/gi";
import SeasonSwitcher from "./components/buttons/SeasonSwitcher.tsx";

export default function App() {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const params = useParams();
    const year = Number(params.season) || new Date().getFullYear()
    const round = Number(params.roundNum) || 1
    const location = useLocation();
    const isLadder = location.pathname.startsWith('/ladder');
    const isRound  = location.pathname.startsWith('/round');
    const isGame   = location.pathname.startsWith('/game');

    const navigate = useNavigate();

    function setYear(newYear: number) {
        if (isLadder) {
            navigate(`/ladder/${newYear}`);
        } else if (isRound) {
            navigate(`/round/${newYear}/${round}`);
        }
    }

    function decrementYear() {
        setYear(year - 1);
    }

    function incrementYear() {
        setYear(year + 1);
    }

    function toggleDarkMode() {
        const darkModePref = localStorage.getItem("darkModePref")
        if (darkModePref === null) {
            localStorage.setItem("darkModePref", "false");
        } else if (darkModePref === "true") {
            localStorage.setItem("darkModePref", "false");
        } else {
            localStorage.setItem("darkModePref", "true");
        }
        document.documentElement.classList.toggle("dark");
    }

    useEffect(() => {
        const darkModePref = localStorage.getItem('darkModePref');
        let setDarkMode = true;
        if (darkModePref === null) {
            localStorage.setItem('darkModePref', 'true');
            setDarkMode = true;
        } else if (darkModePref === "false") {
            setDarkMode = false;
        }
        if (setDarkMode) {
            document.documentElement.classList.add("dark");
        }
    }, [])

    function toggleSidebar() {
        setSidebarVisible(!sidebarVisible);
    }

    const headerFooterStyles = `bg-mist-500 dark:bg-mist-900`
    const buttonStyles = `rounded-lg px-3 py-2 bg-mist-800 hover:bg-mist-700 cursor-pointer`

    return (
        <>
            <div className={`flex flex-col overflow-x-hidden ${sidebarVisible ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>            <header className={`${headerFooterStyles} grid w-full py-3 px-5 justify-center items-center gap-3`}>
                <div className={"flex gap-2 items-center"}>
                    <RoundLadderSwitcher/>
                    <div className={`hidden md:block ${isGame && `hidden md:hidden`}`}>
                        <SeasonSwitcher current={year} min={1897} max={2026} decrementSeason={decrementYear} incrementSeason={incrementYear} setSeason={setYear}/>
                    </div>
                </div>

                <Link to={"/"}
                      className={"rounded-lg py-1 px-3 hover:bg-mist-700 dark:hover:bg-mist-950 cursor-pointer flex gap-2 justify-self-center items-center text-white no-underline"}>
                    <LiaFootballBallSolid className={"text-xl"}/>
                    <h1 className={"text-white text-sm md:text-2xl"}>{APP_NAME}</h1>
                </Link>

                <div className={"flex gap-4 ml-auto text-white"}>
                    <button onClick={toggleDarkMode} className={`${buttonStyles} hidden md:block`}>
                        <MdLightMode/>
                    </button>
                    <button onClick={toggleSidebar} className={`${buttonStyles}`}>
                        <GiHamburgerMenu/>
                    </button>
                </div>
            </header>

            <div className="relative flex-1 h-full">
                <Sidebar visible={sidebarVisible}/>
                <main className={"bg-mist-300 dark:bg-mist-950 pt-2 pb-12 flex flex-col items-center"}>
                    <Outlet/>
                </main>
            </div>

            <footer className={`${headerFooterStyles} py-3 text-white font-light`}>
            <span>Data from <a href={"https://squiggle.com.au/"} target={"_blank"}>Squiggle</a>, site by
                <a href={"https://odis.fm"} target={"_blank"}>odis</a></span>
        </footer>
        </div>
</>
)}