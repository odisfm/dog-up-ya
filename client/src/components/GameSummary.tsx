import './GameSummary.css'
import type {Game, Team} from '@footy-scores/shared'
import GameSummaryTeam from "./GameSummaryTeam.tsx";
import GameSummaryScore from "./GameSummaryScore.tsx";
import {createScreenreaderGameDescription} from "../utils.ts";


export default function GameSummary({gameData, homeTeamData, awayTeamData, isEven}:
                                    {
                                        gameData: Game,
                                        homeTeamData: Team | null,
                                        awayTeamData: Team | null,
                                        isEven: boolean
                                    }) {
    const bg1 = "bg-mist-400 dark:bg-mist-800"
    const bg2 = "bg-mist-500 dark:bg-mist-900"
    const pillStyles = `${isEven ? "bg-mist-600 dark:bg-mist-900" : "bg-mist-700 dark:bg-mist-800"} rounded-md px-3 py-1 justify-self-center self-center text-xs `
    const now = new Date();
    const gameStart = new Date(gameData.unixTime * 1000)
    const preGame = gameStart > now
    return (
        <div
            className={`game-summary ${isEven ? bg1 : bg2} text-white p-4 first-of-type:rounded-t-md last-of-type:rounded-b-md`}
        >
            <span className={"sr-only"}>{createScreenreaderGameDescription(gameData, homeTeamData, awayTeamData)}</span>
            <div aria-hidden={true}>
                <GameSummaryTeam teamData={homeTeamData} gameData={gameData} homeTeam={true}/>
                <div className={"game-summary-detail gap-2 "}>
                    <span className={`venue-name ${pillStyles}`}>{gameData.venue}</span>
                    {preGame &&
                        <>
                        <span className={`pre-game-time text-xl md:text-2xl font-bold self-center`}>
                            {gameStart.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
                        </span>
                        </>
                    }
                    {!preGame &&
                        <>
                            <div className={"home-team"}>
                                <GameSummaryScore
                                    score={gameData.hScore}
                                    margin={gameData.hScore - gameData.aScore}
                                    goals={gameData.hGoals}
                                    behinds={gameData.hBehinds}
                                />
                            </div>
                            <div className={"away-team"}>
                                <GameSummaryScore
                                    score={gameData.aScore}
                                    margin={gameData.aScore - gameData.hScore}
                                    goals={gameData.aGoals}
                                    behinds={gameData.aBehinds}
                                />
                            </div>
                            <span className={`time-string ${pillStyles}`}>{gameData.timeString}</span>
                        </>
                    }

                </div>
                <GameSummaryTeam teamData={awayTeamData} gameData={gameData} homeTeam={false}/>
            </div>
        </div>
    )
}