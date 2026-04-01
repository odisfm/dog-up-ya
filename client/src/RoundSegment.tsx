import GameSummary from "./GameSummary.tsx";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";

export default function RoundSegment({label, games}: {label: string, games: GameResponse[]}){
    if (games.length === 0) {
        return <></>
    }

    return (
        <div className={"flex flex-col mt-6"}>
            <h3 className={"text-white self-start bg-mist-500 dark:bg-mist-900 py-1 px-2 mb-2 rounded-md"}>{label}</h3>
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