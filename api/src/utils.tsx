import type {Game} from "@footy-scores/shared";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.js";

export function serialiseGames(games: GameResponse[]): Game[] {
    return games.map(game => ({
        ...game,
        unixTime: Number(game.unixTime)
    }))
}