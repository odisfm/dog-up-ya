import GameSummary from "./GameSummary/GameSummary.tsx";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import {Link} from "react-router";
import {ROUND_SEGMENT_LIVE_LABEL} from "../consts.ts";

export default function RoundSegment({label, games}: {label: string, games: GameResponse[]}){
    if (games.length === 0) {
        return <></>
    }

    const dullStyles = `bg-mist-700 dark:bg-mist-900`
    const liveStyles = `bg-cyan-800 dark:bg-cyan-700 font-bold text-xl px-4`

    return (
        <section className={"flex flex-col mt-6"}>
            <h3 aria-hidden={true} className={`text-white self-start font-bold ${label === ROUND_SEGMENT_LIVE_LABEL ? liveStyles : dullStyles}  py-1 px-2 mb-2 rounded-md`}>{label}</h3>
            {games.map((game, i) => {
                return (
                    <Link to={`/game/${game.id}`} className={"group"} key={game.id}>
                        <GameSummary
                        gameData={game}
                        homeTeamData={game.homeTeam}
                        awayTeamData={game.awayTeam}
                        segmentIdx={i}
                        segmentLength={games.length}
                    />
                    </Link>
                )
            })}
        </section>
    )
}