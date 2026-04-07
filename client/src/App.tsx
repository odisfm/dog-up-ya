import {TimeProvider} from "./contexts/TimeProvider.tsx";
import AppInner from "./AppInner.tsx";
import {useParams} from "react-router";
import {ViewProvider} from "./contexts/ViewProvider.tsx";
import {PrefsProvider} from "./contexts/PrefsProvider.tsx";

export default function App() {
    const params = useParams();
    let initialYear: number | null = null;
    if (params.season) {
        initialYear = Number(params.season);
    }
    let initialRound: number | null = null;
    if (params.roundNum) {
        initialRound = Number(params.roundNum);
    }

    return (
        <>
            <TimeProvider initialYear={initialYear} initialRound={initialRound}>
             <ViewProvider initialView={"round"} initialSidebarActive={false}>
             <PrefsProvider>
                <AppInner />
             </PrefsProvider>
             </ViewProvider>
            </TimeProvider>
</>
)}