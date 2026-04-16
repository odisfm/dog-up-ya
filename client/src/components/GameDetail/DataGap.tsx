import type { DataGapEvent } from "./ScoreEvents";
import {liStyles, timeStyles, pillStyles} from "./ScoreEventSingle.tsx";
import type {Team} from "@footy-scores/shared";
import TeamFlag from "../TeamFlag.tsx";

const teamStyles = `flex items-center gap-4 font-bold`

export default function DataGap({event, homeTeam, awayTeam}: {
    event: DataGapEvent,
    homeTeam: Team,
    awayTeam: Team,
}) {
    return (
        <li className={`${liStyles}`}>
            <span className={`${pillStyles} ${timeStyles}`}>?</span>
            <div className={"flex gap-4"}>{
                event.hPoints !== 0 &&
                <div className={teamStyles}><TeamFlag teamName={homeTeam.name} size={"xs-sm"}/> +{event.hPoints}</div>
            }
                {
                    event.aPoints !== 0 &&
                    <div className={teamStyles}><TeamFlag teamName={awayTeam.name} size={"xs-sm"}/>+{event.aPoints}</div>
                }</div>
        </li>
    )
}