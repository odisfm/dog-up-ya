import {createContext, useContext, useEffect, useState} from "react";
import {TimeContext, TimeProvider} from "./contexts/TimeProvider.tsx";
import AppInner from "./AppInner.tsx";
import {useParams} from "react-router";
import {ViewContext, ViewProvider} from "./contexts/ViewProvider.tsx";
import {PrefsProvider} from "./contexts/PrefsProvider.tsx";

export default function App() {
    const params = useParams();

    return (
        <>
            <TimeProvider initialYear={Number(params.season) || new Date().getFullYear()} initialRound={Number(params.roundNum) || 1}>
             <ViewProvider initialView={"round"} initialSidebarActive={false}>
             <PrefsProvider>
                <AppInner />
             </PrefsProvider>
             </ViewProvider>
            </TimeProvider>
</>
)}