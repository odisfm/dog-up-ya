import {Outlet} from "react-router";
import { MdLightMode } from "react-icons/md"
import {useEffect} from "react";

function App() {

    function toggleDarkMode() {
        document.documentElement.classList.toggle("dark");
    }

    useEffect(() => {
        let darkModePref = localStorage.getItem('darkModePref');
        if (darkModePref === null) {
            localStorage.setItem('darkModePref', 'true');
            darkModePref = true;
        }
        if (darkModePref) {
            document.documentElement.classList.add("dark");
        }
    }, [])

    return (
        <>
                <header className={`grid grid-cols-3 w-full py-3 px-5 bg-mist-500 dark:bg-mist-900 justify-center items-center gap-3`}>
                    <div></div>
                    <h1 className={"text-white text-2xl"}>Hello</h1>

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
