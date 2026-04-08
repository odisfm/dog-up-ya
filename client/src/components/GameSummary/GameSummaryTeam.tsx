import type {Team} from '@footy-scores/shared'
import TeamFlag from "../TeamFlag.tsx"

export default function GameSummaryTeam({teamData, homeTeam}: {
    teamData: Team | null,
    homeTeam: boolean,
}) {
    return (
        <div className={`flex w-full ${homeTeam ? 'justify-start' : 'justify-end'}`}>
            <div className={`grid grid-rows-2 ${homeTeam ? 'justify-items-start' : 'justify-items-end'}`}>
                    <div className={"self-end"}>
                        <TeamFlag teamName={teamData?.name || "tbd"} size={"sm-md"}/>
                    </div>

                    <span
                    className={`${homeTeam ? 'text-left' : 'text-right'} mt-2 text-sm md:text-md`}>
                    {teamData?.name || "TBD"}
                    </span>
            </div>
        </div>
    )
}