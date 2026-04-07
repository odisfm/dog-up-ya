import {Link} from "react-router";
import {useContext} from "react";
import {TimeContext} from "../../contexts/TimeProvider.tsx";
import {ViewContext} from "../../contexts/ViewProvider.tsx";

export default function RoundLadderSwitcher() {
    const timeContext = useContext(TimeContext)!;
    const viewContext = useContext(ViewContext)!;

    const buttonStyles = `rounded-md px-2 py-1 text-white text-xs`
    const activeButtonStyles = `bg-cyan-700 font-bold hidden md:block`
    const inactiveButtonStyles = `bg-mist-800 hover:bg-mist-700`

    return (
            <div className={`flex gap-2 items-center ${!timeContext.year && `hidden`}`}>
                <Link to={`/round/${timeContext.year}/${timeContext.round}`}
                      className={`${buttonStyles} ${viewContext.view === "round" ? activeButtonStyles : inactiveButtonStyles}`}>
                    Round
                </Link>
                <Link to={`/ladder/${timeContext.year}/`}
                    className={`${buttonStyles} ${viewContext.view === "ladder" ? activeButtonStyles : inactiveButtonStyles}`}>
                    Ladder
                </Link>

            </div>
    )

}