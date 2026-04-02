import {useCallback, useEffect, useState} from "react";
import type {CurrentRoundResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import {Navigate} from "react-router";


export default function RoundNoDetailsRedirect() {
    const [failed, setFailed] = useState(false);
    const [season, setSeason] = useState<number | null>(null);
    const [roundNum,  setRoundNum] = useState<number | null>(null);

    const getLatestDetails = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/round/current`);
            const data = await response.json();
            if (data.data) {
                const _data: CurrentRoundResponse = data.data;
                console.log(_data)
                setSeason(_data.season);
                setRoundNum(_data.roundNum);

            }
            else {
                console.log(data)
                setFailed(true);
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }, []);

    useEffect(() => {
        (async () => {
            await getLatestDetails();
        })()
    }, [getLatestDetails]);

    if (season &&  roundNum !== null) {
        console.log("returning navigate")
        return (
            <Navigate to={`/round/${season}/${roundNum}`} />
        )
    }

    return (
        <h1>oops</h1>
    )
}