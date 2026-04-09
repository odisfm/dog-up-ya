import type {GameDetailsPayload} from "@footy-scores/shared/src/types/apiResponses.ts";
import {useMemo} from "react";
import type {Team} from "@footy-scores/shared";
import TeamFlag from "../TeamFlag.tsx";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";


type TipNumbers = {
    forHome: number
    forAway: number
    marginHome: number
    marginAway: number
}

export default function GameTips({gameData}: {gameData: GameDetailsPayload}) {
    const tipNumbers: TipNumbers = useMemo(() => {
        const tipNumbers: TipNumbers = {
            forHome: 0,
            forAway: 0,
            marginHome: 0,
            marginAway: 0,
        }
        const homeId = gameData.homeTeam!.id
        for (const tip of gameData.tips) {
            if (tip.tipTeamId === null) continue
            const homeTip = tip.tipTeamId === homeId
            if (homeTip) {
                tipNumbers.forHome++
                tipNumbers.marginHome += tip.margin
            } else {
                tipNumbers.forAway++
                tipNumbers.marginAway += tip.margin
            }
        }

        return tipNumbers
    }, [gameData.tips, gameData.homeTeam])

    let aTeam: Team | null = null
    let bTeam: Team | null = null
    let aFor = 0;
    let bFor = 0;
    let aMarginAvg = 0;
    let bMarginAvg = 0;

    if (tipNumbers.forHome > tipNumbers.forAway) {
        aTeam = gameData.homeTeam
        bTeam = gameData.awayTeam
        aFor = tipNumbers.forHome
        bFor = tipNumbers.forAway
        aMarginAvg = tipNumbers.marginHome / tipNumbers.forHome
        bMarginAvg = tipNumbers.forAway / tipNumbers.forAway
    } else if (tipNumbers.forAway > tipNumbers.forHome) {
        aTeam = gameData.awayTeam
        bTeam = gameData.homeTeam
        aFor = tipNumbers.forAway
        bFor = tipNumbers.forHome
        aMarginAvg = tipNumbers.marginAway / tipNumbers.forAway
        bMarginAvg = tipNumbers.marginHome / tipNumbers.forHome
    } else {
        if ((tipNumbers.marginHome / tipNumbers.forHome) >= (tipNumbers.marginAway / tipNumbers.forAway)) {
            aTeam = gameData.homeTeam
            bTeam = gameData.awayTeam
            aFor = tipNumbers.forHome
            bFor = tipNumbers.forAway
            aMarginAvg = tipNumbers.marginHome / tipNumbers.forHome
            bMarginAvg = tipNumbers.marginAway / tipNumbers.forAway
        } else {
            aTeam = gameData.awayTeam
            bTeam = gameData.homeTeam
            aFor = tipNumbers.forAway
            bFor = tipNumbers.forHome
            aMarginAvg = tipNumbers.marginAway / tipNumbers.forAway
            bMarginAvg = tipNumbers.marginHome / tipNumbers.forHome
        }
    }

    const numTipsters = gameData.tips.length
    const gameOver = gameData.timeString === "Full Time"
    const wasDraw = gameOver && gameData.winnerTeamId === null

    return (
        <div className={"text-left"}>
            <div>
                {
                    aFor > bFor &&
                    <div className={"text-black dark:text-white"}>
                    <h4 className={"font-bold mb-2"}>Tipster's choice</h4>
                    <div className={"flex gap-2 items-center"}>
                        <TeamFlag teamName={aTeam!.name} size={"sm-md"}/>
                        <span className={"text-lg font-bold"}>{aTeam!.name}</span>
                        { gameOver && !wasDraw &&
                            <>
                            {
                                aTeam!.id === gameData.winnerTeamId ?
                                    <IoMdCheckmarkCircle />
                                    :
                                    <ImCross />
                            }
                            </>
                        }
                    </div>
                    </div>
                }
                <p className={"flex flex-col gap-1 mt-4 rounded-md bg-mist-600 dark:bg-mist-800 self-start p-4"}>
                    <span>{aFor}/{numTipsters} tipped <strong>{aTeam!.name}</strong>, with an average margin of {aMarginAvg.toFixed(1)}.</span>
                    { bFor > 0 &&
                        <span>{bFor}/{numTipsters} tipped <strong>{bTeam!.name}</strong>, with an average margin of {bMarginAvg.toFixed(1)}.</span>
                    }
                </p>
                <table className={"text-black dark:text-white mt-4 border-separate border-spacing-0 overflow-hidden rounded-md"}>
                    <thead>
                        <tr className={"*:px-2 *:pt-4 text-white bg-mist-700 dark:bg-mist-900"}>
                            <th>
                                {"Tipster"}
                            </th>
                            <th>
                                {"Tip"}
                            </th>
                            {
                                gameOver &&
                                <th>
                                    <IoMdCheckmarkCircle />
                                </th>
                            }
                            <th>
                                {"Margin"}
                            </th>
                            <th>
                                {"Confidence"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        gameData.tips.map((tip, index) => {
                            return (
                                <tr className={"*:px-2 *:pt-2 odd:bg-mist-200 even:bg-mist-300 dark:odd:bg-mist-800 even:dark:bg-mist-900"}>
                                    <td className={"text-right"}>
                                        {tip.sourceName}
                                    </td>
                                    <td className={"flex items-center gap-2"}>
                                        <TeamFlag teamName={
                                            tip.tipTeamId === gameData.homeTeam!.id ? gameData.homeTeam!.name : gameData.awayTeam!.name
                                        } size={"xs"} />
                                        <span className={"font-bold"}>{tip.tipTeamId === gameData.homeTeam!.id ? gameData.homeTeam!.name : gameData.awayTeam!.name}</span>
                                    </td>
                                    {
                                        gameOver &&
                                        <td className={""}>
                                            {
                                                !wasDraw && tip.tipTeamId === gameData.winnerTeamId &&
                                                    <IoMdCheckmarkCircle  className={"text-lime-500"}/>
                                            }
                                            {
                                                !wasDraw && tip.tipTeamId !== gameData.winnerTeamId &&
                                                <ImCross  className={"text-neutral-400 text-sm"}/>
                                            }
                                        </td>
                                    }
                                    <td className={"font-bold"}>
                                        {tip.margin.toFixed(1)}
                                    </td>
                                    <td>
                                        {Math.round(tip.confidence)}%
                                    </td>
                                </tr>

                            )
                        })
                    }
                    </tbody>
                </table>
            </div>

        </div>
    )
}