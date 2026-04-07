import RoundLadderSwitcher from "./buttons/RoundLadderSwitcher.tsx";
import SeasonSwitcher from "./buttons/SeasonSwitcher.tsx";
import {APP_NAME} from "../consts.ts";
import {LiaFootballBallSolid} from "react-icons/lia";
import {MdLightMode} from "react-icons/md";
import {GiHamburgerMenu} from "react-icons/gi";
import {Link} from "react-router";

export default function Header({toggleSidebar}: {toggleSidebar: () => void}) {
    const headerStyles = `bg-mist-500 dark:bg-mist-900`
    const buttonStyles = `rounded-lg px-3 py-2 bg-mist-800 hover:bg-mist-700 cursor-pointer`
    return (
        <header className={`${headerStyles} grid w-full py-3 px-5 justify-center items-center gap-3`}>
            <div className={"flex gap-2 items-center"}>
                <RoundLadderSwitcher/>
                <div className={`hidden md:block ${false && `hidden md:hidden`}`}>
                    <SeasonSwitcher />
                </div>
            </div>

            <Link to={"/"}
                  className={"rounded-lg py-1 px-3 hover:bg-mist-700 dark:hover:bg-mist-950 cursor-pointer flex gap-2 justify-self-center items-center text-white no-underline"}>
                <LiaFootballBallSolid className={"text-xl"}/>
                <h1 className={"text-white text-sm md:text-2xl"}>{APP_NAME}</h1>
            </Link>

            <div className={"flex gap-4 ml-auto text-white"}>
                {/*<button onClick={toggleDarkMode} className={`${buttonStyles} hidden md:block`}>*/}
                {/*    <MdLightMode/>*/}
                {/*</button>*/}
                <button onClick={toggleSidebar} className={`${buttonStyles}`}>
                    <GiHamburgerMenu/>
                </button>
            </div>
        </header>
    )
}