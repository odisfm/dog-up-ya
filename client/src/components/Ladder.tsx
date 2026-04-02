import {useEffect, useState} from "react";
import type {LadderResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import TeamFlag from "./TeamFlag.tsx";

export default function Ladder() {
    const [ladder, setLadder] = useState<LadderResponse | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ladder`);
                const data = await response.json();
                if (data.data) {
                    setLadder(data.data);
                }
                else {
                    setFailed(true);
                }
            } catch (e) {
                console.error(e);
                setFailed(true);
            }

        })()
    }, []);

    return (
        <>
            {!failed  && !ladder &&
            <h1>Getting ladder...</h1>
            }
            {failed &&
            <h1>Failed to get ladder... :(</h1>
            }

            {ladder &&
            <table className={"border-separate border-spacing-0 rounded-lg overflow-hidden"}>
                <thead className={""}>
                <tr className={"*:px-2 *:pt-4 bg-mist-500 dark:bg-mist-700 text-white"}>
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
                        <tr key={standing.team.id}
                            className={"bg-neutral-100 odd:bg-neutral-200 dark:bg-mist-800 odd:dark:bg-mist-900 dark:text-white *:p-2"}>
                            <td className={"px-3 text-right"}>
                                {i + 1}
                            </td>
                            <td className={"text-left flex gap-2 items-center"}>
                                <TeamFlag teamName={standing.team.name} size={"xs"} />
                                {standing.team.name.length < 17 ? standing.team.name : standing.team.abbreviation}
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