import {createContext, type ReactNode, useState} from "react";

interface TimeContextType {
    year: number | null;
    round: number | null;
    setYear: (year: number | null) => void;
    setRound: (round: number | null) => void;
}

export const TimeContext = createContext<TimeContextType | null>(null);

export function TimeProvider({ children, initialYear, initialRound}:
{children: ReactNode, initialYear: number | null, initialRound: number | null}) {
    const [year, setYear] = useState<number| null>(initialYear);
    const [round, setRound] = useState<number | null>(initialRound);

    return (
        <TimeContext.Provider value={{ year, round, setYear, setRound }}>
            {children}
        </TimeContext.Provider>
    )
}
