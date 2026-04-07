import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import {Outlet, useLocation, useParams, useNavigate} from "react-router";
import {useContext, useEffect, useState} from "react";
import {TimeContext} from "./contexts/TimeProvider.tsx";

export default function AppInner() {
    const timeContext = useContext(TimeContext)!;
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isLadder = location.pathname.startsWith('/ladder');
    const isRound  = location.pathname.startsWith('/round');
    const isGame   = location.pathname.startsWith('/game');
    const params = useParams();
    const year = Number(params.season)
    const round = Number(params.roundNum)

    useEffect(() => {
        if (isRound) {
            navigate(`/round/${timeContext.year}/${timeContext.round}`, { replace: true });
        } else if (isLadder) {
            navigate(`/ladder/${timeContext.year}`, { replace: true });
        }
    }, [timeContext.year, timeContext.round, isRound, isLadder, navigate]);


    const headerFooterStyles = `bg-mist-500 dark:bg-mist-900`

    function toggleSidebar() {
        setSidebarVisible(!sidebarVisible);
    }

    return (
        <>

            <Header toggleSidebar={toggleSidebar} />
            <div
                className={`flex flex-col overflow-x-hidden ${sidebarVisible ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>


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
    )
}