import GameSummary from "./GameSummary.tsx";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";

export default function RoundSegment({label, games}: {label: string, games: GameResponse[]}){
    if (games.length === 0) {
        return <></>
    }

    return (
        <div className={"flex flex-col mt-6"}>
            <h3 className={"text-black dark:text-white self-start px-2 md:px-0"}>{label}</h3>
            {games.map((game, i) => {
                return (
                    <GameSummary
                        gameData={game}
                        homeTeamData={game.homeTeam}
                        awayTeamData={game.awayTeam}
                        isEven={i % 2 == 0}
                    />
                )
            })}
        </div>
    )
}