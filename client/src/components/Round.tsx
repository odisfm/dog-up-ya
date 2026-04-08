import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import type {Round as RoundType, Team} from "@footy-scores/shared/src"
import type {
    GameResponse,
    RoundResponse,
    SeasonResponse
} from "@footy-scores/shared/src/types/apiResponses.ts";
import ScrollingTabBar, {type TabBarItem} from "./ScrollingTabBar.tsx";
import {areGamesLive} from "../utils.ts";
import {REFRESH_TIME_MS, ROUND_SEGMENT_LIVE_LABEL} from "../consts.ts";
import {differenceInMinutes, isThisWeek, isThisYear, formatDate, isBefore, isToday} from "date-fns";
import RoundSegment from "./RoundSegment.tsx";
import {TimeContext} from "../contexts/TimeProvider.tsx";
import Section from "./Section.tsx";
import TeamFlag from "./TeamFlag.tsx";
import type {FinalType} from "@footy-scores/shared/src/generated/prisma/enums.ts";

type RoundSegmentEntry = { label: string; date: Date; games: GameResponse[] }

type RoundGrouping = {
    liveGames: GameResponse[],
    pastGames: RoundSegmentEntry[],
    futureGames: RoundSegmentEntry[],
}

export default function Round() {
    const timeContext = useContext(TimeContext)!;
    const [failed, setFailed] = useState(false);
    const [hasLiveGames, setHasLiveGames] = useState(false);
    const [roundData, setRoundData] = useState<RoundResponse | null>(null);
    const [seasonData, setSeasonData] = useState<SeasonResponse | null>(null);
useState<RoundType[]>([]);

    const fetchThisRoundData = useCallback(async () => {
        if (!timeContext.year || timeContext.round === null) {
            return
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/round/${timeContext.year}/${timeContext.round}`);
            const data = await response.json();
            if (data.data) {
                setRoundData(data.data);
                setHasLiveGames(areGamesLive(data.data.games))
            }
            else {
                setFailed(true);
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [timeContext.year, timeContext.round]);

    const fetchSeasonData = useCallback(async () => {
        if (!timeContext.year) {
            return
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/season/${timeContext.year}/rounds`);
            const data = await response.json();
            if (data.data) {
                const _data: SeasonResponse = data.data;
                setSeasonData(_data)
            }
            else {
                console.error(`All seasons round data missing`)
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [timeContext.year]);


    useEffect(() => {
        (async () => {
            await fetchThisRoundData();
        })()
    }, [fetchThisRoundData]);

    useEffect(() => {
        (async () => {
            await fetchSeasonData();
        })()
    }, [fetchSeasonData]);



    useEffect(() => {
        if (hasLiveGames) return;
        if (!roundData) return;

        const now = new Date();
        let soonestGame: Date | null = null;

        for (const game of roundData.games) {
            const gameStartTime = new Date(game.unixTime * 1000);
            if (now > gameStartTime) {
                continue;
            }
            if (!soonestGame) {
                soonestGame = gameStartTime;
            } else if (gameStartTime < soonestGame) {
                soonestGame = gameStartTime
            }
        }

        if (!soonestGame || differenceInMinutes(soonestGame, now) > (60 * 24)) {
            return;
        }

        const minutesTilNextGame = differenceInMinutes(soonestGame, now);

        const timer = setTimeout(fetchThisRoundData, minutesTilNextGame * 60_000)
        return () => {
            clearTimeout(timer);
        }

    }, [hasLiveGames, roundData, fetchThisRoundData]);

    useEffect(() => {
        if (!hasLiveGames) return;

        const interval = setInterval(fetchThisRoundData, REFRESH_TIME_MS);
        return () => clearInterval(interval);
    }, [hasLiveGames, fetchThisRoundData]);

    const roundSegments: RoundGrouping | null = useMemo(() => {
        if (!roundData) return null
        const roundGrouping = {
            liveGames: [] as GameResponse[],
            pastGames: new Map<string, { date: Date; games: GameResponse[] }>(),
            futureGames: new Map<string, { date: Date; games: GameResponse[] }>(),
        }
        const now = new Date()
        for (const gameData of roundData.games) {
            if (areGamesLive([gameData])) {
                roundGrouping.liveGames.push(gameData);
                continue;
            }
            let dateString: string;
            const gameStartTime = new Date(gameData.unixTime * 1000);
            const inPast = isBefore(gameStartTime, now)
            if (isToday(gameStartTime)) {
                dateString = `Today`
            } else if (isThisWeek(gameStartTime, {weekStartsOn: 1}) && isBefore(now, gameStartTime)) {
                dateString = formatDate(gameStartTime, "EEEE")
            } else if (isThisYear(gameStartTime)) {
                dateString = formatDate(gameStartTime, "EEEE, do LLLL")
            } else {
                dateString = formatDate(gameStartTime, "PPPP")
            }
            const group = inPast ? roundGrouping.pastGames : roundGrouping.futureGames
            if (group.has(dateString)) {
                group.get(dateString)!.games.push(gameData)
            } else {
                group.set(dateString, { date: gameStartTime, games: [gameData] })
            }
        }

        const sortEntries = (map: typeof roundGrouping.pastGames): RoundSegmentEntry[] =>
            [...map.entries()]
                .map(([label, { date, games }]) => ({ label, date, games }))
                .sort((a, b) => a.date.getTime() - b.date.getTime())

        return {
            liveGames: roundGrouping.liveGames,
            pastGames: sortEntries(roundGrouping.pastGames),
            futureGames: sortEntries(roundGrouping.futureGames),
        }
    }, [roundData]);

    const roundItems: TabBarItem[] = []
    if (seasonData) {
        for (const roundData of seasonData.rounds) {
            let label = roundData.name as string;
            if (label.startsWith("Round")) {
                label = `R${roundData.roundNumber}`
            }
            roundItems.push({
                label,
                link: `/round/${timeContext.year}/${roundData.roundNumber}`,
                roundNumber: roundData.roundNumber
            })
        }
    }

    const byeTeams: Team[] = useMemo(() => {
        if (!roundData || !seasonData) return [];
        const finalType: FinalType = roundData.finalType
        if (finalType !== "NOT_FINAL") {
            return []
        }
        const teams: Team[] = []
        for (const seasonTeam of seasonData.seasonTeams) {
            const team = seasonTeam.team
            let hasGame = false
            for (const gameData of roundData.games!) {
                if (gameData.homeTeam?.id === team.id || gameData.awayTeam?.id === team.id) {
                    hasGame = true
                    break
                }
            }
            if (!hasGame) {
                teams.push(team)
            }
        }
        return teams
    }, [seasonData, roundData])

    console.log({byeTeams})

    return (
        <>
            { roundItems.length &&
                <ScrollingTabBar items={roundItems} activeItem={`/round/${timeContext.year}/${timeContext.round}`} />
            }
            <div className={"flex flex-col w-full"}>
                {roundSegments &&
                    roundSegments.liveGames &&
                    <RoundSegment label={ROUND_SEGMENT_LIVE_LABEL} games={roundSegments.liveGames} key={ROUND_SEGMENT_LIVE_LABEL}/>
                }
                {roundSegments?.futureGames.map(({ label, games }) => (
                    <RoundSegment label={label} games={games} key={label} />
                ))}
                {roundSegments?.pastGames.map(({ label, games }) => (
                    <RoundSegment label={label} games={games} key={label} />
                ))}

            </div>
            { byeTeams.length > 0 &&
                <div className={"mt-8"}>
                    <Section title={"Byes"} headingLevel={3} collapsible={false}>
                    <div className={"flex flex-wrap gap-4 mt-2"}>
                        {byeTeams.map((team) => {
                            return (
                                <div key={team.id} className={"flex gap-2"}>
                                    <TeamFlag teamName={team.name} size={"sm"}></TeamFlag>
                                    <span className={"text-black dark:text-white"}>{team.name}</span>
                                </div>
                            )
                        })}
                        </div>
                    </Section>
                </div>
            }
        </>
    )
}