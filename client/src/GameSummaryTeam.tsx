import type {Team, Game} from '@footy-scores/shared'

export default function GameSummaryTeam({teamData, gameData, homeTeam}: {
    teamData: Team | null,
    gameData: Game,
    homeTeam: boolean,
}) {
    return (
        <div className={`flex w-full ${homeTeam ? 'justify-start' : 'justify-end'}`}>
            <div className={`grid grid-rows-2 ${homeTeam ? 'justify-items-start' : 'justify-items-end'}`}>
                {/*<div></div>/!*spacer*!/*/}
                {/*<div className={`${homeTeam ? 'text-left' : 'text-right'} w-full`}>*/}
                    { teamData &&
                        <>
                            <div className={"w-10 h-5 md:w-20 md:h-10 bg-white self-end"}></div>

                            <span
                            className={`${homeTeam ? 'text-left' : 'text-right'} mt-2 text-xs`}>
                            {teamData.name.length < 17 ? teamData.name : teamData.abbreviation}
                            </span>
                        </>
                    }
                    {
                        !teamData &&
                        <span className={"text-center self-center"}>TBD</span>
                    }
                {/*</div>*/}
            </div>
        </div>
    )
}