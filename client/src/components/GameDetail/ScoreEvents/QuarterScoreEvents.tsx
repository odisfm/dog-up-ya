import type {DataGapEvent, EventArray} from "./ScoreEvents.tsx";
import type {Quarter} from "date-fns";
import type {ScoreEvent, Team} from "@footy-scores/shared";
import ScoreEventSingle from "./ScoreEventSingle.tsx";
import DataGap from "./DataGap.tsx";

function isDataGapEvent(input: DataGapEvent | ScoreEvent): boolean {
    return Boolean("hPoints" in input && "aPoints" in input);
}

export default function QuarterScoreEvents({events, quarter, homeTeam, awayTeam, isOver}: {
    events: EventArray,
    quarter: Quarter,
    homeTeam: Team,
    awayTeam: Team,
    isOver: boolean,
}) {


    return (
        <>
            {
                <h3 className={"self-start text-xl font-bold p-2 px-4 bg-cyan-700 rounded-md"}>{`Q${quarter}`}</h3>
            }
            { events.length > 0 &&
                <ul className={"flex flex-col gap-1 w-full mb-4"}>
                    { events.map((event)=> {
                        if (isDataGapEvent(event)) {
                            const e = event as DataGapEvent
                            return (
                                <DataGap event={e} homeTeam={homeTeam} awayTeam={awayTeam}/>
                            )
                        }

                        const e = event as ScoreEvent

                        return (
                            <ScoreEventSingle
                                scoringTeam={e.type === "HOME_GOAL" || e.type === "HOME_BEHIND" ? homeTeam : awayTeam}
                                homeTeam={homeTeam}
                                awayTeam={awayTeam}
                                event={e}
                                key={e.id}
                            />
                        )
                    })}
                </ul>
            }
        </>
    )
}