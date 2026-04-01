import type {Game, Team} from "@footy-scores/shared";
import {differenceInMinutes, formatDate} from "date-fns";

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

export function createScreenreaderGameDescription(game: Game, homeTeam: Team | null, awayTeam: Team | null) {
    let description = ""
    const venueName = game.venue || "venue TBD";
    const date = formatDate(new Date(game.unixTime * 1000), "eeee, do MMMM hh:mmaa");
    if (!homeTeam || !awayTeam) {
        description += `Teams for game at ${venueName}, ${date}, are undecided.`
        return description;
    }
    description += `${homeTeam.name} host ${awayTeam.name} at ${venueName}`
    if (!game.timeString) {
        description += `, starting ${date}. `
        return description;
    }
    description += `. `

    const leadTerm = game.timeString !== "Full Time" ? "lead" : "win"
    const drawTerm = game.timeString !== "Full Time" ? "Scores are level" : "Ended in a draw"

    if (game.hScore > game.aScore) {
        description += `${homeTeam.name} ${leadTerm} ${game.hGoals}, ${game.hBehinds}, ${game.hScore} 
        to ${game.aGoals}, ${game.aBehinds}, ${game.aScore}`
    } else if (game.aScore > game.hScore) {
        description += `${awayTeam.name} ${leadTerm} ${game.aGoals}, ${game.aBehinds}, ${game.aScore} 
        to ${game.hGoals}, ${game.hBehinds}, ${game.hScore}`
    } else {
        description += `${drawTerm}; `
        if (game.hScore === 0 && game.aScore === 0) {
            description += `both teams yet to score.`
        } else {
            description += `${homeTeam.name} ${game.hGoals}, ${game.hBehinds}, ${game.hScore}
            to ${game.aGoals}, ${game.aBehinds}, ${game.aScore}`
        }
    }
    return description;
}