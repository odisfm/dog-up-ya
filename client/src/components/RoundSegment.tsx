import GameSummary from "./GameSummary/GameSummary.tsx";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import {Link} from "react-router";

export default function RoundSegment({label, games}: {label: string, games: GameResponse[]}){
    if (games.length === 0) {
        return <></>
    }

    const dullStyles = `bg-mist-700 dark:bg-mist-900`
    const liveStyles = `bg-cyan-800 dark:bg-cyan-700 font-bold`

    return (
        <section className={"flex flex-col mt-6"}>
            <h3 aria-hidden={true} className={`text-white self-start ${label === "Live!" ? liveStyles : dullStyles}  py-1 px-2 mb-2 rounded-md`}>{label}</h3>
            {games.map((game, i) => {
                return (
                    <Link to={`/game/${game.id}`} className={"group"}>
                        <GameSummary
                        gameData={game}
                        homeTeamData={game.homeTeam}
                        awayTeamData={game.awayTeam}
                        isEven={i % 2 == 0}
                        key={game.id}
                    />
                    </Link>
                )
            })}
        </section>
    )
}