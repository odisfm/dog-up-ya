import { useParams } from "react-router";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {GameResponse, RoundResponse} from "@footy-scores/shared/src/types/apiResponses";
import {areGamesLive} from "./utils.ts";
import {REFRESH_TIME_MS} from "./consts.ts";
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

    const fetchRoundData = useCallback(async () => {
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

    useEffect(() => {
        (async () => {
            await fetchRoundData();
        })()
    }, [fetchRoundData]);

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

        const timer = setTimeout(fetchRoundData, minutesTilNextGame * 60_000)
        return () => {
            clearTimeout(timer);
        }

    }, [hasLiveGames, roundData, fetchRoundData]);

    useEffect(() => {
        if (!hasLiveGames) return;

        const interval = setInterval(fetchRoundData, REFRESH_TIME_MS);
        return () => clearInterval(interval);
    }, [hasLiveGames, fetchRoundData]);

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

    console.log(roundSegments)

    return (
        <div className={"flex flex-col  w-full  md:w-2/3"}>
            {roundSegments &&
                roundSegments.liveGames &&
                    <RoundSegment label={"Live!"} games={roundSegments.liveGames} />
            }
            {roundSegments &&
                roundSegments.futureGames &&
                Object.entries(roundSegments.futureGames).map(([label, games], i) => {
                    return <RoundSegment label={label} games={games} />
                })
            }
            {roundSegments &&
                roundSegments.pastGames && !allGamesFinished &&
                    <h2>Finished games</h2>
            }
            {roundSegments &&
            roundSegments.futureGames &&
                Object.entries(roundSegments.pastGames).map(([label, games], i) => {
                    return <RoundSegment label={label} games={games} />
                })
            }

        </div>
    )
}