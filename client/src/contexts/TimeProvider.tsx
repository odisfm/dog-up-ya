import {createContext, type ReactNode, useState} from "react";

interface TimeContextType {
    year: number | null;
    round: number | null;
    setYear: (year: number | null) => void;
    setRound: (round: number | null) => void;
    setFirstRound: (round: number) => void;
    setLastRound: (round: number | null) => void;
    latestYear: number | null;
    latestRound: number | null;
    setLatestYear: (year: number | null) => void;
    setLatestRound: (round: number | null) => void;
}

export const TimeContext = createContext<TimeContextType | null>(null);

export function TimeProvider({ children, initialYear, initialRound}:
{children: ReactNode, initialYear: number | null, initialRound: number | null}) {
    const [year, setYear] = useState<number| null>(initialYear);
    const [round, setRound] = useState<number | null>(initialRound);
    const [firstRound, setFirstRound] = useState<number | null>(initialRound);
    const [lastRound, setLastRound] = useState<number | null>(initialRound);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [latestRound, setLatestRound] = useState<number | null>(null);

    function safeSetRound(round: number | null): void {
        if (lastRound !== null && firstRound !== null && round !== null) {
            if (round < firstRound) {
                round = firstRound
            } else if (round > lastRound) {
                round = lastRound
            }
        }
        setRound(round)
    }

    return (
        <TimeContext.Provider value={{
            year,
            round,
            setYear,
            setRound: safeSetRound,
            setFirstRound,
            setLastRound,
            latestYear,
            latestRound,
            setLatestYear,
            setLatestRound,
        }}>
            {children}
        </TimeContext.Provider>
    )
}
