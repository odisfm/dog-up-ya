import {useContext, useEffect, useMemo, useState} from "react";
import type {LadderResponse, LadderPayload} from "@footy-scores/shared/src/types/apiResponses.ts";
import type {Season} from "@footy-scores/shared"
import TeamFlag from "./TeamFlag.tsx";
import {FaTrophy} from "react-icons/fa";
import {TimeContext} from "../contexts/TimeProvider.tsx";

export default function Ladder() {
    const [ladder, setLadder] = useState<LadderPayload | null>(null);
    const [season, setSeason] = useState<Season | null>(null);
    const [failed, setFailed] = useState(false);
    const timeContext = useContext(TimeContext)!;

    useEffect(() => {
        if (!timeContext.year) {
            return
        }
        (async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ladder/${timeContext.year}`);
                const data = await response.json();
                if (data.data) {
                    const _data: LadderResponse = data.data;
                    setLadder(_data.ladder);
                    setSeason(_data.season);
                }
                else {
                    setFailed(true);
                }
            } catch (e) {
                console.error(e);
                setFailed(true);
            }

        })()
    }, [timeContext.year]);


    const finals1bg = `bg-cyan-600`
    const finals2bg = `bg-yellow-600`

    const positionFinalsBgs: string[] = useMemo(() => {
        if (!ladder || ! season) {
            return []
        }
        const bgs = []
        for (let i = 0; i < ladder.length; i++) {
            if (!season.finalsQualifiers.length) {
                bgs.push("")
            } else if (i < season.finalsQualifiers[0]) {
                bgs.push(finals1bg)
            } else if (season.finalsQualifiers.length > 1 && i < season.finalsQualifiers[1]) {
                bgs.push(finals2bg)
            }
        }
        return bgs;
    }, [ladder, season, finals1bg, finals2bg])

    return (
        <>
            {!failed  && !ladder &&
            <h1>Getting ladder...</h1>
            }
            {failed &&
            <h1>Failed to get ladder... :(</h1>
            }

            {ladder && season &&
            <table className={"border-separate border-spacing-0 rounded-lg text-xs md:text-sm w-full"}>
                <thead className={""}>
                <tr className={"*:px-2 *:pt-4 bg-mist-500 dark:bg-mist-700 text-white"}>
                    <th className={"w-1 px-0 pt-0 !p-0"}></th>
                    <th className={"px-3 text-right"}>#</th>
                    <th className={"text-left"}>Team</th>
                    <th>Played</th>
                    <th>Won</th>
                    <th>Pts</th>
                    <th>%</th>
                </tr>
                </thead>
                <tbody>
                    {ladder.map((standing, i) => (
                        <tr key={`${standing.team.id}${season.year}`}
                            className={"bg-neutral-200 odd:bg-neutral-300 dark:bg-mist-800 odd:dark:bg-mist-900 dark:text-white *:p-2"}>
                            <td className={`!p-0 ${positionFinalsBgs[i]}`}></td>
                            <td className={"px-3 text-right"}>
                                {i + 1}
                            </td>
                            <td className={"text-left flex gap-2 items-center font-bold"}>
                                <TeamFlag teamName={standing.team.name} size={"xs"} />
                                {standing.team.name.length < 17 ? standing.team.name : standing.team.abbreviation}
                                {season.premierTeamId === standing.teamId &&
                                    <FaTrophy className={"text-yellow-600"}/>
                                }
                            </td>
                            <td>
                                {standing.played}
                            </td>
                            <td>
                                {standing.wins}
                            </td>
                            <td>
                                {standing.premPoints}
                            </td>
                            <td>
                                {standing.percentage.toFixed(1)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            }
        </>
    )
}