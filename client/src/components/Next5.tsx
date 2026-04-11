import type {FutureGame} from "./Ladder.tsx";
import TeamFlag from "./TeamFlag.tsx";
import {FaHouseChimney} from "react-icons/fa6";

export function Next5({fixture, teamId}: {fixture: FutureGame[], teamId: string}) {
    return (
        <td key={`${teamId}_next5`}>
            <div className={"flex h-full gap-1 justify-center"}>
                {fixture.map((game: FutureGame, i) => {
                    return (
                        <div key={i} className={"flex-col gap-1"}
                             aria-label={`${game.opponent.name}, ${game.atHome ? `at home` : `away`}`}
                             role={"img"}
                        >
                            <span aria-hidden={true}><TeamFlag teamName={game.opponent.name} size={"xs"}/></span>
                                { game.atHome &&
                                    <span aria-hidden={true}>
                                        <FaHouseChimney className={"text-[8px] text-gray-700 dark:text-gray-300 " +
                                        "relative left-1 top-1"}
                                        />
                                    </span>
                                }
                        </div>
                    )
                })}
            </div>
        </td>
    )
}