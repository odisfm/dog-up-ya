import { useParams } from "react-router";
import {useCallback, useEffect, useState} from "react";
import type {RoundResponse} from "@footy-scores/shared/src/types/apiResponses";
import GameSummary from "./GameSummary.tsx";
import {areGamesLive} from "./utils.ts";
import {REFRESH_TIME_MS} from "./consts.ts";
import {differenceInMinutes} from "date-fns";

export default function Round() {
    const params = useParams();
    const [failed, setFailed] = useState(false);
    const [hasLiveGames, setHasLiveGames] = useState(false);
    const [roundData, setRoundData] = useState<RoundResponse | null>(null);
    console.log(params);

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

    return (
        <div className={"flex flex-col  w-full  md:w-2/3"}>
            {roundData && roundData.games.map((gameData, i) => {
                return <GameSummary
                    gameData={gameData}
                    homeTeamData={gameData.homeTeam}
                    awayTeamData={gameData.awayTeam}
                    key={gameData.id}
                    isEven={!(i % 2 === 0)}
                />
            })}
        </div>
    )
}