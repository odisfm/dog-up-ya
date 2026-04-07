import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import {Outlet, useLocation, useNavigate} from "react-router";
import {useContext, useEffect} from "react";
import {TimeContext} from "./contexts/TimeProvider.tsx";
import {ViewContext} from "./contexts/ViewProvider.tsx";

export default function AppInner() {
    const timeContext = useContext(TimeContext)!;
    const viewContext = useContext(ViewContext)!;
    const navigate = useNavigate();
    const location = useLocation();
    const isLadder = location.pathname.startsWith('/ladder');
    const isRound  = location.pathname.startsWith('/round');
    const isGame   = location.pathname.startsWith('/game');

    useEffect(() => {
        if (isRound) {
            navigate(`/round/${timeContext.year}/${timeContext.round}`, { replace: true });
        } else if (isLadder) {
            navigate(`/ladder/${timeContext.year}`, { replace: true });
        }
    }, [timeContext.year, timeContext.round, isRound, isLadder, navigate]);

    useEffect(() => {
        if (isLadder) {
            viewContext.setView("ladder")
        }
        else if (isRound) {
            viewContext.setView("round")
        } else if (isGame) {
            viewContext.setView("game")
        }
    }, [viewContext, isLadder, isRound, isGame]);


    const headerFooterStyles = `bg-mist-500 dark:bg-mist-900`


    return (
        <>

            <Header />
            <div
                className={`flex flex-col overflow-x-hidden ${viewContext.sidebarActive ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>


                <div className="relative flex-1 h-full">
                    <Sidebar />
                    <main className={"bg-mist-300 dark:bg-mist-950 pt-2 pb-12 flex flex-col items-center"}>
                        <Outlet/>
                    </main>
                </div>

                <footer className={`${headerFooterStyles} py-3 text-white font-light text-xs`}>
                    <span>data from <a href={"https://squiggle.com.au/"} target={"_blank"}>Squiggle</a>, site by <a href={"https://odis.fm"} target={"_blank"}>odis</a></span>
                </footer>
            </div>
        </>
    )
}