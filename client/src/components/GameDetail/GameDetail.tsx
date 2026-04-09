import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import GameSummary from "../GameSummary/GameSummary.tsx";
import {Link, Navigate, useParams} from "react-router";
import type {GameDetailsPayload, GameDetailsResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import type {Season, Round} from "@footy-scores/shared"
import { formatDate } from "date-fns";
import ScoreEvents from "./ScoreEvents.tsx";
import GameLinks from "./GameLinks.tsx";
import Section from "../Section.tsx";
import GameTips from "./GameTips.tsx";
import {TimeContext} from "../../contexts/TimeProvider.tsx";
import {PrefsContext} from "../../contexts/PrefsProvider.tsx";
import {isInSpoilerWindow} from "../../utils.ts";


export default function GameDetail() {
    const prefsContext = useContext(PrefsContext)!;
    const params = useParams();
    const timeContext = useContext(TimeContext)!;
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

    useEffect(() => {
        if (!roundData || !seasonData) {
            return;
        }
        timeContext.setRound(roundData.roundNumber)
        timeContext.setYear(seasonData.year)
    }, [timeContext, roundData, seasonData]);

    const isSpoiler = !!(gameData && !prefsContext.showSpoilers && isInSpoilerWindow(gameData.localTime) && !prefsContext.spoilerIgnoredGames.includes(gameData.id))

    const showScoreEvents = useMemo(() => {
        if (!gameData || !gameData.homeTeam || !gameData.awayTeam) {
            return false
        }
        if (isSpoiler) {
            return false
        }
        if (gameData.timeString === "Full Time" && gameData.scoreEvents.length === 0) {
            return false
        }
        return true

    }, [gameData, isSpoiler]);

    const showTips = Boolean(gameData && gameData.tips.length)

    if (!params.gameId) {
        return (
            <Navigate to={"/round"} />
        )
    }

    if (!gameData || !seasonData || !roundData) {
        return <h2>{"Loading..."}</h2>
    }

    return (
        <div className={"flex flex-col text-white mt-2 items-start w-full"}>
            <h2 className={"font-black text-left text-xl md:text-5xl mb-1 rounded-lg px-2 pr-6 py-1 bg-mist-700 dark:bg-mist-800"}>
                {gameData.homeTeam?.name || "TBD"} v {gameData.awayTeam?.name || "TBD"}
            </h2>
            <Link to={`/round/${seasonData.year}/${roundData.roundNumber}`} className={"group"}>
                <h3 className=
                        {"font-bold text-lg md:text-xl mb-1 rounded-lg px-2 py-1 bg-mist-600 dark:bg-mist-700 group-hover:bg-mist-700 dark:group-hover:bg-mist-700"}
                >
                {roundData.name}, {seasonData.year} {seasonData.isPremSeason && `Premiership Season`}
                </h3>
            </Link>
            <h4 className={"font-light text-md md:text-lg mb-4 rounded-lg px-2 py-1 bg-mist-500 dark:bg-mist-600 "}>
                {gameData.venue}, {formatDate(gameData.localTime, "EEEE do MMMM, yyyy")}
            </h4>


            <GameSummary gameData={gameData} homeTeamData={gameData.homeTeam} awayTeamData={gameData.awayTeam}
                        segmentIdx={0} segmentLength={1}/>

            { showScoreEvents && gameData.homeTeam && gameData.awayTeam && gameData.timeString !== null &&
                <>
                    <Section title={"Scoring shots"} headingLevel={3} collapsible={true} prefName={"scoreEvents"} collapsedDefault={true} role={null}>
                        <ScoreEvents scoreEvents={gameData.scoreEvents} homeTeam={gameData.homeTeam}
                                  awayTeam={gameData.awayTeam}/>
                    </Section>
                </>
            }

            { !isSpoiler && showTips && gameData.homeTeam && gameData.awayTeam && gameData.tips.length &&
                <>
                    <Section title={"Tips"} headingLevel={3} collapsible={true} collapsedDefault={true} prefName={"tips"}>
                        <GameTips gameData={gameData}/>
                    </Section>
                </>
            }
        </div>
    )

}