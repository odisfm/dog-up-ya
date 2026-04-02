import type {Game} from "@footy-scores/shared";
import type {GameResponse, GameGetPayload} from "@footy-scores/shared/src/types/apiResponses.js";

export function serialiseGames(games: GameGetPayload[]): GameResponse[] {
    return games.map(game => ({
        ...game,
        unixTime: Number(game.unixTime)
    }))
}