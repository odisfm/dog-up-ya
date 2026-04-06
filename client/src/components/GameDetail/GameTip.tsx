import type {Team, Tip} from "@footy-scores/shared";
import TeamFlag from "../TeamFlag.tsx";

export default function GameTip({tipData, homeTeam, awayTeam}: {tipData: Tip, homeTeam: Team, awayTeam: Team}) {
    const tipTeam = tipData.tipTeamId === homeTeam.id ? homeTeam : awayTeam;

    return (
        <div className={"flex flex-col gap-2 py-1 px-2 bg-mist-600 dark:bg-mist-800 rounded-lg"}>
            <h4 className={"font-bold rounded-md bg-mist-800 dark:bg-mist-950"}>{tipData.sourceName}</h4>
            <div className={"flex gap-2 items-center"}>
                <TeamFlag teamName={tipTeam.name} size={"xs"} />
                <span>{tipTeam.name} by {tipData.margin}</span>
            </div>
        </div>
    )
}