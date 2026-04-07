import {createContext, useContext, useEffect, useState} from "react";
import {TimeContext, TimeProvider} from "./contexts/TimeProvider.tsx";
import AppInner from "./AppInner.tsx";
import {useParams} from "react-router";

export default function App() {
    const timeContext = useContext(TimeContext)!;
    const params = useParams();




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
            <TimeProvider initialYear={Number(params.season) || new Date().getFullYear()} initialRound={Number(params.roundNum) || 1}>
                <AppInner />
            </TimeProvider>
</>
)}