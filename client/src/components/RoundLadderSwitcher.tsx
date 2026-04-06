import {Link, useLocation, useParams} from "react-router";

export default function RoundLadderSwitcher() {
    const params = useParams();
    const year = params.season || new Date().getFullYear()
    const round = params.round || 1
    const location = useLocation();
    const isLadder = location.pathname.startsWith('/ladder');
    const isRound  = location.pathname.startsWith('/round');
    const isGame   = location.pathname.startsWith('/game');

    const buttonStyles = `rounded-md px-2 py-1 text-white`
    const activeButtonStyles = `bg-cyan-700 font-bold hidden md:block`
    const inactiveButtonStyles = `bg-mist-800`

    return (
            <div className={"flex gap-2 items-center"}>
                <Link to={`/round/${year}/${round}`}
                      className={`${buttonStyles} ${isRound ? activeButtonStyles : inactiveButtonStyles}`}>
                    Round
                </Link>
                <Link to={`/ladder/${year}/`}
                    className={`${buttonStyles} ${isLadder ? activeButtonStyles : inactiveButtonStyles}`}>
                    Ladder
                </Link>

            </div>
    )

}