import type {
    GameResponse,
    GameGetPayload,
    GameDetailsPayload
} from "@footy-scores/shared/src/types/apiResponses.js";

export function serialiseGames(games: GameGetPayload[]): GameResponse[] | GameDetailsPayload[] {
    return games.map(game => ({
        ...game,
        unixTime: Number(game.unixTime)
    }))
}