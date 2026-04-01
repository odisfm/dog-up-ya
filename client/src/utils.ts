import type {Game} from "@footy-scores/shared";
import {differenceInMinutes} from "date-fns";

export function areGamesLive(games: Game[], preGameMinutesMargin=15): boolean {
    const now = new Date();
    for (const game of games) {
        if (game.timeString === "Full Time") {
            continue;
        } else if (game.timeString) {
            return true
        }

        const gameStartTime = new Date(game.unixTime * 1000);

        if (differenceInMinutes(gameStartTime, now) <= preGameMinutesMargin) {
            return true;
        }
    }
    return false;
}