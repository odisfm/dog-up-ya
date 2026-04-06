import {Outlet} from "react-router";
import { MdLightMode } from "react-icons/md"
import {useEffect} from "react";
import {APP_NAME} from "./consts.ts";
import { LiaFootballBallSolid } from "react-icons/lia";

function App() {

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

    return (
        <>
                <header className={`grid grid-cols-3 w-full py-3 px-5 bg-mist-500 dark:bg-mist-900 justify-center items-center gap-3`}>
                    <div></div>

                    <div className={"flex gap-2 justify-self-center items-center text-white"}>
                        <LiaFootballBallSolid className={"text-xl"}/>
                        <h1 className={"text-white text-2xl"}>{APP_NAME}</h1>
                    </div>

                    <div className={"ml-auto"}>
                        <button
                            className={"text-white"}
                            onClick={toggleDarkMode}
                        >
                            <MdLightMode/>
                        </button>
                    </div>
                </header>

                <main className={"bg-mist-300 dark:bg-mist-950 pt-2 pb-12 flex flex-col items-center flex-1"}>
                    <Outlet/>
                </main>
        </>
    )
}

export default App
