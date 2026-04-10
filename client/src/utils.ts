import type {Game, Team} from "@footy-scores/shared";
import {differenceInHours, differenceInMinutes, formatDate} from "date-fns";
import {SPOILER_WINDOW_HOURS} from "./consts.ts";

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
        description += `Teams for game at ${venueName}, ${date}, are undecided.\n`
        return description;
    }
    description += `${homeTeam.name} host ${awayTeam.name} at ${venueName}`
    if (!game.timeString) {
        description += `, starting ${date}.\n`
        return description;
    } else if (game.timeString === "Full Time") {
        description += `, full time, game played on ${date}`
    } else {
        description += `, live now, ${game.timeString}`
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
    description += `.\n`
    return description;
}

export function isInSpoilerWindow(gameStart: Date) {
    const hoursSinceStart = differenceInHours(new Date(), gameStart)
    return hoursSinceStart > 0 && hoursSinceStart < SPOILER_WINDOW_HOURS
}

export function checkApiHeadersVersionMismatch(response: Response) {
    console.log("checking headers")
    console.log(response.headers);
    if (response.headers.has("X-App-Version")) {
        const versionHeader = response.headers.get("X-App-Version");
        if (versionHeader === "null") { // returns literal "null" in dev
            console.log("X-App-Version null")
            return
        }
        console.log(`Header: ${versionHeader}`)
        if (versionHeader !== __COMMIT_HASH__) {
            console.log(`Header mismatch, reloading. api: ${versionHeader}, client: ${__COMMIT_HASH__}`)
            window.location.reload()
        }
    } else {
        console.log(`headers dont include "X-App-Version"`)
    }
}
