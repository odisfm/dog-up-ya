import type {ScoreEvent, Team} from "@footy-scores/shared";
import {useMemo} from "react";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import QuarterScoreEvents from "./QuarterScoreEvents.tsx";
import Worm from "./Worm.tsx";

export type DataGapEvent = {
    hPoints: number
    aPoints: number
}

export type EventArray = (ScoreEvent | DataGapEvent )[]

type GameEvents = {
    q1: EventArray
    q2: EventArray
    q3: EventArray
    q4: EventArray
}

export type Quarter = 1 | 2 | 3 | 4

function determineQuarter(input: string | null): Quarter {
    if (input === null) {
        return 1
    }
    if (input.startsWith("Q")) {
        return Number(input.split("Q")[1][0]) as Quarter
    }
    switch (input) {
        case "1/4 Time":
            return 1
        case "1/2 Time":
            return 2
        case "3/4 Time":
            return 3
        case "Full Time":
            return 4
        default: // should never happen
            return 1
    }
}

export default function ScoreEvents({gameData, scoreEvents, homeTeam, awayTeam}:
    {
        gameData: GameResponse,
        scoreEvents: ScoreEvent[],
        homeTeam: Team,
        awayTeam: Team,
    }) {

    const { gameEvents, integrity } = useMemo((): { gameEvents: GameEvents; integrity: boolean } => {
        const _scoreEvents = scoreEvents.toReversed()
        const gameEvents: GameEvents = {q1: [], q2: [], q3: [], q4: [],}
        let runningHomeScore = 0
        let runningAwayScore = 0
        let integrity = true
        for (const event of _scoreEvents) {
            const quarter = determineQuarter(event.timeString)
            const eventArray = gameEvents[`q${quarter}`]
            let expectedHomeScore: number
            let expectedAwayScore: number
            switch (event.type) {
                case "HOME_GOAL":
                    expectedHomeScore = runningHomeScore + 6
                    expectedAwayScore = runningAwayScore
                    break
                case "HOME_BEHIND":
                    expectedHomeScore = runningHomeScore + 1
                    expectedAwayScore = runningAwayScore
                    break
                case "AWAY_GOAL":
                    expectedHomeScore = runningHomeScore
                    expectedAwayScore = runningAwayScore + 6
                    break
                case "AWAY_BEHIND":
                    expectedHomeScore = runningHomeScore
                    expectedAwayScore = runningAwayScore + 1
                    break
            }
            const homeDiff = (event.hScore || 0) - expectedHomeScore
            const awayDiff = (event.aScore || 0) - expectedAwayScore
            if (homeDiff !== 0 || awayDiff !== 0) {
                eventArray.push({hPoints: homeDiff, aPoints: awayDiff} satisfies DataGapEvent)
                integrity = false
            }
            eventArray.push(event)
            runningHomeScore = event.hScore || 0
            runningAwayScore = event.aScore || 0
        }
        gameEvents.q1 = gameEvents.q1.toReversed()
        gameEvents.q2 = gameEvents.q2.toReversed()
        gameEvents.q3 = gameEvents.q3.toReversed()
        gameEvents.q4 = gameEvents.q4.toReversed()
        return {gameEvents, integrity}

    }, [scoreEvents])
    
    const currentQuarter: Quarter = determineQuarter(gameData.timeString)

    return (
        <div className={"flex flex-col gap-1 w-full"} role={"log"}>
            { scoreEvents.length === 0 &&
                <span className={"self-start mb-2 text-black dark:text-white"}>Both teams yet to score</span>
            }
            {
                <Worm gameData={gameData} scoreEvents={scoreEvents} integrity={integrity}/>
            }

            { currentQuarter >= 4 &&
                <QuarterScoreEvents
                    events={gameEvents.q4}
                    quarter={4}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    isOver={gameData.timeString === "Full Time"}
                />
            }
            {
                currentQuarter >= 3 &&
                <QuarterScoreEvents
                    events={gameEvents.q3}
                    quarter={3}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    isOver={currentQuarter > 3 || gameData.timeString === "3/4 Time"}
                />
            }
            {
                currentQuarter >= 2 &&
                <QuarterScoreEvents
                    events={gameEvents.q2}
                    quarter={2}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    isOver={currentQuarter > 2 || gameData.timeString === "1/2 Time"}
                />
            }
            {
                currentQuarter >= 1 &&
                <QuarterScoreEvents
                    events={gameEvents.q1}
                    quarter={1}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    isOver={currentQuarter > 1 || gameData.timeString === "1/4 Time"}
                />
            }

            
        </div>
    )
}