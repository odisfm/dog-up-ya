import {createContext, type ReactNode, useState} from "react";

interface TimeContextType {
    year: number;
    round: number;
    setYear: (year: number) => void;
    setRound: (round: number) => void;
}

export const TimeContext = createContext<TimeContextType | null>(null);

export function TimeProvider({ children, initialYear, initialRound}:
{children: ReactNode, initialYear: number, initialRound: number}) {
    const [year, setYear] = useState<number>(initialYear);
    const [round, setRound] = useState<number>(initialRound);

    return (
        <TimeContext.Provider value={{ year, round, setYear, setRound }}>
            {children}
        </TimeContext.Provider>
    )
}
