import {useContext, useEffect, useMemo, useState} from "react";
import type {
    LadderResponse,
    LadderPayload,
    GameResponse,
    RoundResponse
} from "@footy-scores/shared/src/types/apiResponses.ts";
import type {Season, Team} from "@footy-scores/shared"
import TeamFlag from "./TeamFlag.tsx";
import {FaTrophy} from "react-icons/fa";
import {TimeContext} from "../contexts/TimeProvider.tsx";
import {formatDistance, isAfter} from "date-fns";
import {checkApiHeadersVersionMismatch} from "../utils.ts";
import {useSwipeable} from "react-swipeable";
import {FIRST_SEASON} from "../consts.ts";
import {Next5} from "./Next5.tsx";

type LadderView = "brief" | "extended" | "next-5" | "form"

type TeamDerived = {
    streak: number,
    next5: FutureGame[],
    formWins: number,
    formLosses: number
}

export type FutureGame = {
    opponent: Team,
    atHome: boolean
}

const FORM_WINDOW_ROUNDS = 10

export default function Ladder() {
    const [ladder, setLadder] = useState<LadderPayload | null>(null);
    const [season, setSeason] = useState<Season | null>(null);
    const [rounds, setRounds] = useState<RoundResponse[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [view, setView] = useState<LadderView>("brief");
    const timeContext = useContext(TimeContext)!;
    const swipeHandlers = useSwipeable({
        onSwipedRight: () => {
            if (timeContext.year === null || timeContext.year <= FIRST_SEASON) return
            timeContext.setYear(timeContext.year - 1)
        },
        onSwipedLeft: () => {
            if (timeContext.year === null || timeContext.latestYear === null || timeContext.year >= timeContext.latestYear) return
            timeContext.setYear(timeContext.year + 1)
        },
        preventScrollOnSwipe: true
    })

    useEffect(() => {
        if (!timeContext.year) {
            return
        }
        (async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ladder/${timeContext.year}`);
                checkApiHeadersVersionMismatch(response)
                const data = await response.json();
                if (data.data) {
                    const _data: LadderResponse = data.data;
                    setLadder(_data.ladder);
                    setSeason(_data.season);
                    setRounds(_data.rounds);
                }
                else {
                    setFailed(true);
                }
            } catch (e) {
                console.error(e);
                setFailed(true);
            }

        })()
    }, [timeContext.year]);

    const viewingThisYear = Boolean(timeContext.year === timeContext.latestYear)

    if (!viewingThisYear && ["next-5", "form"].includes(view)) {
        setView("brief");
    }

    const finals1bg = `bg-cyan-600`
    const finals2bg = `bg-yellow-600`

    const positionFinalsBgs: string[] = useMemo(() => {
        if (!ladder || ! season) {
            return []
        }
        const bgs = []
        for (let i = 0; i < ladder.length; i++) {
            if (!season.finalsQualifiers.length) {
                bgs.push("")
            } else if (i < season.finalsQualifiers[0]) {
                bgs.push(finals1bg)
            } else if (season.finalsQualifiers.length > 1 && i < season.finalsQualifiers[1]) {
                bgs.push(finals2bg)
            }
        }
        return bgs;
    }, [ladder, season, finals1bg, finals2bg])

    let updatedDate = null
    updatedDate = useMemo(() => {
        let lastDate = null
        if (!ladder) return null
        for (const standing of ladder) {
            if (!standing.updated) continue
            if (lastDate === null) {
                lastDate = standing.updated
            } else {
                if (isAfter(standing.updated, lastDate)) {
                    lastDate = standing.updated
                }
            }
        }
        return lastDate
    }, [ladder])

    const teamsDerived: Record<string, TeamDerived> = useMemo(() => {
        const derived = {} as Record<string, TeamDerived>
        if (!ladder || !rounds || !viewingThisYear || !timeContext.latestRound) return derived
        const currentRound = timeContext.latestRound
        for (const ladderPos of ladder) {
            const team = ladderPos.team
            let streak = 0
            let formWins = 0
            let formLosses = 0
            const next5: FutureGame[] = []
            for (let i = 0; i < rounds.length; i++) {
                const thisRound = rounds[i]
                let thisGame: GameResponse | null = null
                for (const game of thisRound.games) {
                    if (game.homeTeamId === team.id || game.awayTeamId === team.id) {
                        thisGame = game
                        break
                    }
                }
                if (!thisGame) continue

                if (thisGame.timeString === null || thisGame.timeString !== "Full Time") {
                    break
                }

                const inFormWindow = currentRound - FORM_WINDOW_ROUNDS <= thisRound.roundNumber

                if (thisGame.winnerTeamId) {
                    if (thisGame.winnerTeamId === team.id) {
                        if (streak > 0) {
                            streak += 1
                        } else {
                            streak = 1
                        }
                        if (inFormWindow) {
                            formWins += 1
                        }
                    } else {
                        if (streak < 0) {
                            streak -= 1
                        } else {
                            streak = -1
                        }
                        if (inFormWindow) {
                            formLosses += 1
                        }
                    }
                } else {
                    streak = 0
                }

            }
            for (let i = 0; i < rounds.length; i++) {
                const thisRound = rounds[i]
                if (thisRound.roundNumber < currentRound) continue
                let thisGame: GameResponse | null = null
                for (const game of thisRound.games) {
                    if (game.homeTeamId === team.id || game.awayTeamId === team.id) {
                        thisGame = game
                        break
                    }
                }
                if (thisGame && (thisGame.homeTeam === null || thisGame.awayTeam === null)) {
                    break
                }
                if (!thisGame || thisGame.timeString !== null) {
                    continue
                }

                const atHome = thisGame.homeTeamId === team.id;
                const opponent = atHome ? thisGame.awayTeam! : thisGame.homeTeam!;

                const futureGame: FutureGame = { atHome, opponent };
                next5.push(futureGame);

                if (next5.length === 5) {
                    break
                }
            }

            derived[team.abbreviation] = {
                next5,
                formWins,
                formLosses,
                streak
            }
        }
        return derived
    }, [ladder, rounds, viewingThisYear, timeContext.latestRound])

    const buttonStyles = `px-2 py-1 rounded-md text-white cursor-pointer`
    const inactiveButtonStyles = `bg-mist-700 hover:bg-mist-600`
    const activeButtonStyles = `bg-cyan-700`
    const streakStyles = `rounded-md px-2 py-0 font-bold text-white inline-block w-12`

    return (
        <div className={"flex flex-col gap-2"} {...swipeHandlers}>
            {!failed  && !ladder &&
            <h1>Getting ladder...</h1>
            }
            {failed &&
            <h1>Failed to get ladder... :(</h1>
            }

            {ladder && season &&
            <>
                <h2 className={"text-3xl mt-2 p-2 text-white bg-cyan-600 dark:bg-cyan-700 rounded-md self-start"}>
                    {`${timeContext.year} ladder`}
                </h2>
                {
                    updatedDate && season.premierTeamId === null &&
                    <span className={
                        "self-start text-white mb-2 py-2 px-4 text-left " +
                        "rounded-md bg-mist-500 dark:bg-mist-800"}
                    >{`Last updated ${formatDistance(new Date(), updatedDate)} ago`}</span>
                }

                <div className={"flex gap-1"} aria-label={"select table view"}>
                    <button
                        className={`${buttonStyles} ${view === "brief" ? activeButtonStyles : inactiveButtonStyles}`}
                        onClick={() => setView("brief")}
                    >
                        {"Brief"}
                    </button>
                    <button
                        className={`${buttonStyles} ${view === "extended" ? activeButtonStyles : inactiveButtonStyles}`}
                        onClick={() => setView("extended")}
                    >
                        {"Extended"}
                    </button>
                    { timeContext.year === timeContext.latestYear &&
                        <>
                            <button
                            className={`${buttonStyles} ${view === "next-5" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => setView("next-5")}
                            >
                                {"Next 5"}
                            </button>
                            <button
                            className={`${buttonStyles} ${view === "form" ? activeButtonStyles : inactiveButtonStyles}`}
                            onClick={() => setView("form")}
                            >
                                {"Form"}
                            </button>
                        </>
                }
                </div>

                <table className={"border-separate border-spacing-0 rounded-lg text-xs md:text-sm w-full"}>
                    <thead className={""}>
                    <tr className={"*:px-1 *:md:px-2 *:pt-4 bg-mist-500 dark:bg-mist-700 text-white"}>
                        <th className={"w-1 px-0 pt-0 !p-0"} aria-label={"qualifying for finals"}>
                        </th>
                        <th className={"px-3 text-right"} aria-label={"ladder position"}>
                            <span aria-hidden={true}>#</span>
                        </th>
                        <th className={"text-left"}>Team</th>
                        { ["brief", "extended"].includes(view) &&
                            <>
                                <th aria-label={"played"}>{view === "brief" ? "Played" : "P"}</th>
                                <th aria-label={"won"}>{view === "brief" ? "Won" : "W"}</th>
                            </>
                        }
                        {
                            view === "extended" &&
                            <>
                                <th aria-label={"losses"}>L</th>
                                <th aria-label={"draws"}>D</th>
                                <th aria-label={"points for"}>PF</th>
                                <th aria-label={"points against"}>PA</th>
                            </>
                        }
                        {
                            view === "next-5" &&
                            <th>Opponents</th>
                        }
                        {
                            view === "form" &&
                            <>
                                <th>Last 10</th>
                                <th>Streak</th>
                            </>
                        }
                        { ["brief", "extended"].includes(view) &&
                            <>
                                <th>Pts</th>
                                <th>%</th>
                            </>
                        }
                    </tr>
                    </thead>
                    <tbody>
                        {ladder.map((standing, i) => {
                            const derived = teamsDerived[standing.team.abbreviation]
                            return (
                                <>
                                <tr key={`${standing.team.id}${season.year}`}
                                    className={"bg-neutral-200 odd:bg-neutral-300 dark:bg-mist-800 odd:dark:bg-mist-900 dark:text-white *:p-2"}>
                                    <td className={`!p-0 ${positionFinalsBgs[i]}`}>
                                        <span className={"sr-only"}>{i < positionFinalsBgs.length ? `yes` : `no`}</span>
                                    </td>
                                    <td className={"px-3 text-right"}>
                                        {i + 1}
                                    </td>
                                    <td className={"text-left flex gap-2 items-center font-bold"}>
                                        <span aria-hidden={true}><TeamFlag teamName={standing.team.name} size={"xs"}/></span>
                                        <span className={`${["extended"].includes(view) && `hidden md:inline`}`}>
                                            {standing.team.name.length < 17 ? standing.team.name : standing.team.abbreviation}
                                        </span>
                                        {season.premierTeamId === standing.teamId &&
                                            <FaTrophy className={"text-yellow-600"}/>
                                        }
                                    </td>
                                    { ["brief", "extended"].includes(view) &&
                                        <>
                                            <td>
                                                {standing.played}
                                            </td>
                                            <td>
                                                {standing.wins}
                                            </td>
                                        </>
                                    }
                                    {
                                        view === "extended" &&
                                        <>
                                            <td>{standing.losses}</td>
                                            <td>{standing.draws}</td>
                                            <td>{standing.pointsFor}</td>
                                            <td>{standing.pointsAgainst}</td>
                                        </>
                                        }
                                    {["brief", "extended"].includes(view) &&
                                        <>
                                            <td>
                                                {standing.premPoints}
                                            </td>
                                            <td>
                                            {standing.percentage.toFixed(1)}
                                            </td>
                                        </>
                                    }
                                    {
                                        view === "form" && viewingThisYear &&
                                        <>
                                            <td>{derived.formWins} - {derived.formLosses}</td>
                                            <td>
                                                { derived.streak > 0 &&
                                                    <span className={`${streakStyles} bg-lime-700`}>
                                                        W{derived.streak}
                                                    </span>
                                                }
                                                {
                                                    derived.streak === 0 &&
                                                    <span className={`${streakStyles} bg-gray-500`}>
                                                        -
                                                    </span>
                                                }
                                                {
                                                    derived.streak < 0 &&
                                                    <span className={`${streakStyles} bg-red-800`}>
                                                        L{derived.streak * -1}
                                                    </span>
                                                }
                                            </td>
                                        </>
                                    }
                                    {
                                        view === "next-5" && viewingThisYear &&
                                        <Next5 fixture={derived.next5} teamId={standing.team.id}/>
                                    }
                                </tr>
                            </>
                            )})}
                    </tbody>
                </table>
            </>

            }
        </div>
    )
}