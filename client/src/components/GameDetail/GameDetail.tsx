import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import GameSummary from "../GameSummary/GameSummary.tsx";
import {Link, Navigate, useNavigate, useParams} from "react-router";
import type {GameDetailsPayload, GameDetailsResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import type {Season, Round} from "@footy-scores/shared"
import {differenceInMinutes, formatDate} from "date-fns";
import ScoreEvents from "./ScoreEvents.tsx";
import Section from "../Section.tsx";
import GameTips from "./GameTips.tsx";
import {TimeContext} from "../../contexts/TimeProvider.tsx";
import {PrefsContext} from "../../contexts/PrefsProvider.tsx";
import {isInSpoilerWindow} from "../../utils.ts";
import Worm from "./Worm.tsx";
import {AFL_ERA, REFRESH_TIME_MS} from "../../consts.ts";
import WikiButton from "../buttons/WikiButton.tsx";
import Loading from "../Loading.tsx";
import GameLinks from "./GameLinks.tsx";
import {useSwipeable} from "react-swipeable";


export default function GameDetail() {
    const prefsContext = useContext(PrefsContext)!;
    const params = useParams();
    const timeContext = useContext(TimeContext)!;
    const [gameData, setGameData] = useState<GameDetailsPayload | null>(null);
    const [seasonData, setSeasonData] = useState<Season | null>(null);
    const [roundData, setRoundData] = useState<Round | null>(null);
    const [failed, setFailed] = useState(false);
    const navigate = useNavigate();

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

    const isLive = Boolean(gameData && new Date() > new Date(gameData.unixTime * 1000) && gameData.timeString !== "Full Time")

    const showTips = Boolean(gameData && gameData.tips.length)

    const mainHeadingRef = useCallback((node: HTMLHeadingElement | null) => {
        if (node) {
            const top = node.getBoundingClientRect().top + window.scrollY - 20;
            window.scrollTo({ top, behavior: prefsContext.playAnimations ? "smooth" : "instant" });
        }
    }, [prefsContext.playAnimations]);

    useEffect(() => {
        if (!isLive) return
        const interval = setInterval(fetchGameData, REFRESH_TIME_MS);
        return () => clearInterval(interval);
    }, [fetchGameData, isLive]);

    useEffect(() => {
        if (isLive || !gameData) return
        const minutesTilLive = differenceInMinutes(new Date(gameData.unixTime * 1000), new Date())
        if (minutesTilLive < 0) return
        const interval = setTimeout(fetchGameData, minutesTilLive * 60)
        return () => clearTimeout(interval);

    }, [isLive, gameData, fetchGameData])

    function handleSwipe(direction: "left" | "right") {
        if (!prefsContext.gesturePrefs.global || !prefsContext.gesturePrefs.game || !gameData) return
        (async () => {
            const _direction = direction === "right" ? "prev" : "next";
            const response =
                await fetch(`${import.meta.env.VITE_API_URL}/game/${gameData!.id}/${_direction}`);
            if (!response || !response.ok) {
                return;
            }
            const data = await response.json();
            const _data = data.data;
            if (!_data) {
                return;
            }
            navigate(`/game/${_data}`)

        })()
    }

    const swipeHandlers = useSwipeable({
        onSwipedRight: () => {handleSwipe("right")},
        onSwipedLeft: () => {handleSwipe("left")},
        preventScrollOnSwipe: true
    })

    if (!params.gameId) {
        return (
            <Navigate to={"/round"} />
        )
    }

    if (!gameData || !seasonData || !roundData) {
        return <Loading />
    }

    return (
        <div className={"flex flex-col text-white mt-2 items-start w-full"} {...swipeHandlers}>
            <h2
                className={"font-black text-left text-xl md:text-5xl mb-1 rounded-lg " +
                    "px-3 pr-3 pt-2 pb-1 md:pb-4 bg-cyan-700 dark:bg-cyan-800"}
                ref={mainHeadingRef}
            >
                {gameData.homeTeam?.name || "TBD"} v {gameData.awayTeam?.name || "TBD"}
            </h2>
            <Link to={`/round/${seasonData.year}/${roundData.roundNumber}`} className={"group"}>
                <h3 className=
                        {"text-left font-bold text-lg md:text-xl mb-1 rounded-lg px-2 py-1 bg-mist-700 dark:bg-mist-900 group-hover:bg-mist-700 dark:group-hover:bg-mist-700"}
                >
                {roundData.name}, {seasonData.year} {seasonData.isPremSeason && `Premiership Season`}
                </h3>
            </Link>
            <h4 className={"text-left font-light text-md md:text-lg mb-4 rounded-lg px-2 py-1 bg-mist-600 dark:bg-mist-800"}>
                {gameData.venue}, {formatDate(gameData.localTime, "EEEE do MMMM, yyyy")}
            </h4>


            <GameSummary gameData={gameData} homeTeamData={gameData.homeTeam} awayTeamData={gameData.awayTeam}
                        segmentIdx={0} segmentLength={1} isGrandFinal={roundData.finalType === "GRAND_FINAL"}/>

            { timeContext.year && roundData.finalType === "GRAND_FINAL" &&
                <aside className={"self-start my-2"}>
                    <WikiButton
                        url={`https://en.wikipedia.org/wiki/${timeContext.year}_${timeContext.year >= AFL_ERA ? `AFL` : `VFL`}_Grand_Final`}
                        label={`${timeContext.year} ${timeContext.year >= AFL_ERA ? `AFL` : `VFL`} Grand Final`}
                    />
                </aside>
            }
            {
                gameData.gameLinks &&
                <aside className={"self-start my-2"}>
                    <GameLinks linkData={gameData.gameLinks}/>
                </aside>
            }

            { showScoreEvents && gameData.homeTeam && gameData.awayTeam && gameData.timeString !== null &&
                <>
                    <Section title={"Scoring shots"} headingLevel={3} collapsible={true} prefName={"scoreEvents"} collapsedDefault={true} role={null}>
                        <Worm gameData={gameData} scoreEvents={gameData.scoreEvents} />
                        <ScoreEvents gameData={gameData} scoreEvents={gameData.scoreEvents} homeTeam={gameData.homeTeam}
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