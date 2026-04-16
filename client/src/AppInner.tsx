import Header from "./components/Header.tsx";
import Sidebar from "./components/Sidebar.tsx";
import {Outlet, useLocation, useNavigate} from "react-router";
import {useContext, useEffect} from "react";
import {TimeContext} from "./contexts/TimeProvider.tsx";
import {ViewContext} from "./contexts/ViewProvider.tsx";
import type {CurrentRoundResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import Footer from "./components/Footer.tsx";
import {checkApiHeadersVersionMismatch} from "./utils.ts";

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

    useEffect(() => {
        (async () => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/round/current`);
            checkApiHeadersVersionMismatch(response)
            if (response) {
                const data = await response.json();
                const _data: CurrentRoundResponse = data.data
                timeContext.setLatestYear(_data.season)
                timeContext.setLatestRound(_data.roundNum)
            }
        })()
    })

    useEffect(() => {
        if (!timeContext.year || timeContext.round === null) {
            (async () => {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/round/current`);
                checkApiHeadersVersionMismatch(response)

                if (!response) {
                    // todo: setFailed()
                }
                const data = await response.json();
                const _data: CurrentRoundResponse = data.data;
                timeContext.setYear(_data.season)
                timeContext.setRound(_data.roundNum)

            })()
        }
    }, [timeContext, timeContext.year, timeContext.round]);

    return (
        <>

            <Header />
            <div
                className={`flex flex-col overflow-x-hidden ${viewContext.sidebarActive ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>


                <div className="relative flex-1 h-full">
                    <Sidebar />
                    <main
                        className={"bg-mist-300 dark:bg-mist-950 pt-2 pb-12 flex flex-col items-center min-h-[100vh] "}
                        onClick={() => viewContext.setSidebarActive(false)}
                    >
                        <div className={"w-full md:w-2/3 lg:w-3/5 xl:w-2/5 p-2 md:p-0"}>
                            <Outlet/>
                        </div>
                    </main>
                </div>

                <Footer />
            </div>
        </>
    )
}