import {Navigate, useParams} from "react-router";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {Round as RoundType} from "@footy-scores/shared/src"
import type {
    GameResponse,
    RoundResponse,
    SeasonAllRoundsResponse
} from "@footy-scores/shared/src/types/apiResponses.ts";
import ScrollingTabBar, {type TabBarItem} from "./ScrollingTabBar.tsx";
import {areGamesLive} from "../utils.ts";
import {REFRESH_TIME_MS} from "../consts.ts";
import {differenceInMinutes, isThisWeek, isThisYear, formatDate, isBefore} from "date-fns";
import RoundSegment from "./RoundSegment.tsx";

type RoundSegment = Record<string, GameResponse[]>

type RoundGrouping = {
    liveGames: GameResponse[],
    pastGames: RoundSegment,
    futureGames: RoundSegment,
}

export default function Round() {
    const params = useParams();
    const [failed, setFailed] = useState(false);
    const [hasLiveGames, setHasLiveGames] = useState(false);
    const [roundData, setRoundData] = useState<RoundResponse | null>(null);
    const [seasonAllRoundsData, setSeasonAllRoundsData] = useState<RoundType[]>([]);

    const fetchThisRoundData = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/round/${params.season}/${params.roundNum}`);
            const data = await response.json();
            if (data.data) {
                setRoundData(data.data);
                setHasLiveGames(areGamesLive(data.data.games))
                console.log(data.data);
            }
            else {
                setFailed(true);
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [params.season, params.roundNum]);

    const fetchSeasonAllRoundsData = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/season/${params.season}/rounds`);
            const data = await response.json();
            if (data.data) {
                const _data: SeasonAllRoundsResponse = data.data;
                setSeasonAllRoundsData(_data)
            }
            else {
                console.error(`All seasons round data missing`)
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [params.season]);


    useEffect(() => {
        (async () => {
            await fetchThisRoundData();
            await fetchSeasonAllRoundsData();
        })()
    }, [fetchThisRoundData, fetchSeasonAllRoundsData]);

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
        const roundGrouping: RoundGrouping = {
            liveGames: [],
            pastGames: {},
            futureGames: {}
        }
        const now = new Date()
        for (const gameData of roundData.games) {
            if (areGamesLive([gameData])) {
                console.log(`game is live: ${gameData.localTime} timestr: ${gameData.timeString}`)
                roundGrouping.liveGames.push(gameData);
                continue;
            }
            let dateString: string;
            const gameStartTime = new Date(gameData.unixTime * 1000);
            const inPast = isBefore(gameStartTime, now)
            if (isThisYear(gameStartTime)) {
                dateString = formatDate(gameStartTime, "EEEE")
                dateString += `, ${formatDate(gameStartTime, "do")}`
                dateString += ` ${formatDate(gameStartTime, "LLLL")}`

            } else {
                dateString = formatDate(gameStartTime, "PPPP")
            }
            const group = inPast ? roundGrouping.pastGames : roundGrouping.futureGames
            if (dateString in group) {
                group[dateString].push(gameData)
            } else {
                group[dateString] = [gameData]
            }
        }
        return roundGrouping
    }, [roundData]);

    const allGamesFinished =
        !!roundSegments && roundSegments.liveGames.length === 0 && Object.keys(roundSegments.futureGames).length === 0

    const roundItems: TabBarItem[] = []
    for (const roundData of seasonAllRoundsData) {
        let label = roundData.name as string;
        if (label.startsWith("Round")) {
            label = `R${roundData.roundNumber}`
        }
        roundItems.push({
            label,
            link: `/round/${params.season}/${roundData.roundNumber}`
        })
    }


    console.log(roundSegments)

    return (
        <>
            { seasonAllRoundsData &&
                <ScrollingTabBar items={roundItems} activeItem={`/round/${params.season}/${params.roundNum}`} />
            }
            <div className={"flex flex-col  w-full  md:w-2/3 p-1 md:p-0"}>
                {roundSegments &&
                    roundSegments.liveGames &&
                    <RoundSegment label={"Live!"} games={roundSegments.liveGames}/>
                }
                {roundSegments &&
                    roundSegments.futureGames &&
                    Object.entries(roundSegments.futureGames).map(([label, games], i) => {
                        return <RoundSegment label={label} games={games}/>
                    })
                }
                {roundSegments &&
                    roundSegments.futureGames &&
                    Object.entries(roundSegments.pastGames).map(([label, games], i) => {
                        return <RoundSegment label={label} games={games}/>
                    })
                }

            </div>
        </>
    )
}