import { useParams } from "react-router";
import {useEffect, useState} from "react";
import type {RoundResponse} from "@footy-scores/shared/src/types/apiResponses";
import GameSummary from "./GameSummary.tsx";

export default function Round() {
    const params = useParams();
    const [failed, setFailed] = useState(false);
    const [roundData, setRoundData] = useState<RoundResponse | null>(null);
    console.log(params);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/round/${params.season}/${params.roundNum}`);
                const data = await response.json();
                if (data.data) {
                    setRoundData(data.data);
                    console.log(data.data);
                }
                else {
                    setFailed(true);
                }
            } catch (e) {
                console.error(e);
                setFailed(true);
            }

        })()
    }, []);

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