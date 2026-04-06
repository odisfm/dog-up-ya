import {useCallback, useEffect, useState} from "react";
import GameSummary from "../GameSummary/GameSummary.tsx";
import {Link, Navigate, useParams} from "react-router";
import type {GameDetailsPayload, GameDetailsResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import type {Season, Round} from "@footy-scores/shared"
import { formatDate } from "date-fns";
import ScoreEvents from "./ScoreEvents.tsx";


export default function GameDetail() {
    const params = useParams();
    const [gameData, setGameData] = useState<GameDetailsPayload | null>(null);
    const [seasonData, setSeasonData] = useState<Season | null>(null);
    const [roundData, setRoundData] = useState<Round | null>(null);
    const [failed, setFailed] = useState(false);

    const fetchGameData = useCallback(async () => {
        if (!params?.gameId) {
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/game/${params?.gameId}`);
            const data = await response.json();
            if (data.data) {
                const _data: GameDetailsResponse = data.data;
                setGameData(_data.game)
                setSeasonData(_data.season)
                setRoundData(_data.round)
            }
            else {
                setFailed(true);
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, [params]);

    useEffect(() => {
        if (!params?.gameId) {
            return;
        }
        (async () => {
           await fetchGameData();
        })()
    }, [params.gameId, fetchGameData]);

    if (!params.gameId) {
        return (
            <Navigate to={"/round"} />
        )
    }

    if (!gameData || !seasonData || !roundData) {
        return <h2>{"Loading..."}</h2>
    }

    return (
        <div className={"flex flex-col text-white mt-2 items-start w-full md:w-2/3 px-2 md:px-0"}>
            <h2 className={"text-3xl mb-1 rounded-lg px-2 pr-6 py-1 bg-mist-700 dark:bg-mist-700"}>
                {gameData.homeTeam?.name || "TBD"} v {gameData.awayTeam?.name || "TBD"}
            </h2>
            <Link to={`/round/${seasonData.year}/${roundData.roundNumber}`} className={"group"}>
                <h3 className=
                        {"text-2xl mb-1 rounded-lg px-2 py-1 bg-mist-600 dark:bg-mist-800 group-hover:bg-mist-700 dark:group-hover:bg-mist-700"}
                >
                {roundData.name}, {seasonData.year} {seasonData.isPremSeason && `Premiership Season`}
                </h3>
            </Link>
            <h4 className={"text-xl mb-4 rounded-lg px-2 py-1 bg-mist-500 dark:bg-mist-900"}>
                {gameData.venue}, {formatDate(gameData.localTime, "EEEE do MMMM, yyyy")}
            </h4>


            <GameSummary gameData={gameData} homeTeamData={gameData.homeTeam} awayTeamData={gameData.awayTeam}
                        segmentIdx={0} segmentLength={1}/>

            { gameData.homeTeam && gameData.awayTeam && gameData.timeString !== null &&
                <>
                    <h3 className={"mt-3 mb-3 text-xl px-3 py-1 rounded-md bg-mist-700"}>Scoring shots</h3>
                    <ScoreEvents scoreEvents={gameData.scoreEvents} homeTeam={gameData.homeTeam}
                              awayTeam={gameData.awayTeam}/>
                </>
            }
        </div>
    )

}