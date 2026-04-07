import {Link, useLocation, useParams} from "react-router";
import {useContext} from "react";
import {TimeContext} from "../../contexts/TimeProvider.tsx";

export default function RoundLadderSwitcher() {
    const params = useParams();
    const timeContext = useContext(TimeContext)!;
    const year = params.season || new Date().getFullYear()
    const round = params.roundNum || 1
    const location = useLocation();
    const isLadder = location.pathname.startsWith('/ladder');
    const isRound  = location.pathname.startsWith('/round');
    const isGame   = location.pathname.startsWith('/game');

    const buttonStyles = `rounded-md px-2 py-1 text-white`
    const activeButtonStyles = `bg-cyan-700 font-bold hidden md:block`
    const inactiveButtonStyles = `bg-mist-800`

    return (
            <div className={"flex gap-2 items-center"}>
                <Link to={`/round/${timeContext.year}/${timeContext.round}`}
                      className={`${buttonStyles} ${isRound ? activeButtonStyles : inactiveButtonStyles}`}>
                    Round
                </Link>
                <Link to={`/ladder/${timeContext.year}/`}
                    className={`${buttonStyles} ${isLadder ? activeButtonStyles : inactiveButtonStyles}`}>
                    Ladder
                </Link>

            </div>
    )

}