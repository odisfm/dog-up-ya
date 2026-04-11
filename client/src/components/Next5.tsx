import type {FutureGame} from "./Ladder.tsx";
import TeamFlag from "./TeamFlag.tsx";
import {FaHouseChimney} from "react-icons/fa6";

export function Next5({fixture, teamId}: {fixture: FutureGame[], teamId: string}) {
    return (
        <td key={`${teamId}_next5`}>
            <div className={"flex h-full gap-1 justify-center"}>
                {fixture.map((game: FutureGame, i) => {
                    return (
                        <div key={i} className={"flex-col justify-items-center items-center gap-1"}>
                                <TeamFlag teamName={game.opponent.name} size={"xs"}/>
                                { game.atHome &&
                                    <FaHouseChimney className={"text-[8px] text-gray-700 dark:text-gray-300"}/>
                                }
                        </div>
                    )
                })}
            </div>
        </td>
    )
}