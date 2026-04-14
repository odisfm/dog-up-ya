import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router";
import type {Team} from "@footy-scores/shared/src"
import type {
    GameResponse,
    RoundResponse,
    SeasonResponse
} from "@footy-scores/shared/src/types/apiResponses.ts";
import RoundSelector from "./RoundSelector.tsx";
import {areGamesLive, checkApiHeadersVersionMismatch} from "../utils.ts";
import {REFRESH_TIME_MS, ROUND_SEGMENT_LIVE_LABEL} from "../consts.ts";
import {differenceInMinutes, isThisWeek, isThisYear, formatDate, isBefore, isToday, isSameDay} from "date-fns";
import RoundSegment from "./RoundSegment.tsx";
import {TimeContext} from "../contexts/TimeProvider.tsx";
import Section from "./Section.tsx";
import TeamFlag from "./TeamFlag.tsx";
import type {FinalType} from "@footy-scores/shared/src/generated/prisma/enums.ts";
import {useSwipeable} from "react-swipeable";
import Loading from "./Loading.tsx";
import {PrefsContext} from "../contexts/PrefsProvider.tsx";

type RoundSegmentEntry = { label: string; date: Date; games: GameResponse[] }

type RoundGrouping = {
    liveGames: GameResponse[],
    pastGames: RoundSegmentEntry[],
    futureGames: RoundSegmentEntry[],
}

export default function Round() {
    const timeContext = useContext(TimeContext)!;
    const prefsContext = useContext(PrefsContext)!;
    const [failed, setFailed] = useState(false);
    const [hasLiveGames, setHasLiveGames] = useState(false);
    const [roundData, setRoundData] = useState<RoundResponse | null>(null);
    const [seasonData, setSeasonData] = useState<SeasonResponse | null>(null);
    const navigate = useNavigate();
    const swipeHandlers = useSwipeable({
        onSwipedRight: () => {
            if (!prefsContext.gesturePrefs.global || !prefsContext.gesturePrefs.round) return;
            if (timeContext.round === null) return
            timeContext.setRound(timeContext.round - 1)
        },
        onSwipedLeft: () => {
            if (!prefsContext.gesturePrefs.global || !prefsContext.gesturePrefs.round) return;
            if (timeContext.round === null) return
            timeContext.setRound(timeContext.round + 1)
        },
        preventScrollOnSwipe: true
    })

    const fetchThisRoundData = useCallback(async () => {
        if (!timeContext.year || timeContext.round === null) {
            return
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/round/${timeContext.year}/${timeContext.round}`);
            checkApiHeadersVersionMismatch(response)
            const data = await response.json();
            if (data.data) {
                setRoundData(data.data);
                setHasLiveGames(areGamesLive(data.data.games))
            }
            else {
                if (data.error) {
                    console.error(data.error);
                    if (data.error.startsWith("No data for season")) { // No data for season x round y
                        if (timeContext.round === 0 || timeContext.round > 4) {
                            timeContext.setRound(1)
                        }
                    } else if (data.error.startsWith("No data for year")) { // No data for year "x"
                        navigate(`/round`)
                    }
                }
                setFailed(true);
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [timeContext, navigate]);

    const fetchSeasonData = useCallback(async () => {
        if (!timeContext.year) {
            return
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/season/${timeContext.year}/rounds`);
            checkApiHeadersVersionMismatch(response)
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
        if (!seasonData) return
        timeContext.setFirstRound(seasonData.rounds.at(0)!.roundNumber)
        timeContext.setLastRound(seasonData.rounds.at(-1)!.roundNumber)
    }, [seasonData, timeContext]);

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
        let allGamesSameDay = true;
        const firstGameDate = roundData.games[0].localTime
        if (roundData.finalType === "NOT_FINAL") {
            for (const gameData of roundData.games) {
                if (!isSameDay(gameData.localTime, firstGameDate) || gameData.timeString !== null) {
                    allGamesSameDay = false;
                    break;
                }
            }
        } else {
            allGamesSameDay = false;
        }

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
            if (allGamesSameDay) {
                dateString = `Schedule TBA`
            } else if (isToday(gameStartTime)) {
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

    if (!seasonData || !roundData) {
        return <Loading />
    }


    return (
        <>
            {seasonData && <RoundSelector seasonData={seasonData}/>}

            <div className={"flex flex-col w-full"} {...swipeHandlers}>
                {roundData && roundSegments &&
                    roundSegments.liveGames &&
                    <RoundSegment
                        label={ROUND_SEGMENT_LIVE_LABEL}
                        games={roundSegments.liveGames}
                        key={ROUND_SEGMENT_LIVE_LABEL}
                        roundData={roundData}
                    />
                }
                {roundData && roundSegments?.futureGames.map(({ label, games }) => (
                    <RoundSegment
                        label={label}
                        games={games}
                        key={label}
                        roundData={roundData}
                    />
                ))}
                {roundData && roundSegments?.pastGames.map(({ label, games }) => (
                    <RoundSegment
                        label={label}
                        games={games}
                        key={label}
                        roundData={roundData}
                    />
                ))}

            </div>
            { byeTeams.length > 0 &&
                <div className={"mt-8"}>
                    <Section title={"Byes"} headingLevel={3} collapsible={false}>
                    <div className={"px-2 md:px-0 grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2"}>
                        {byeTeams.map((team) => {
                            return (
                                <div key={team.id} className={"flex gap-2 items-center text-left"}>
                                    <TeamFlag teamName={team.name} size={"xs-sm"}></TeamFlag>
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