import "./GameProgressBar.css"
import GameProgressSegment from "./GameProgressSegment.tsx";
import GameProgressInterval, {GameProgressIntervalStatus} from "./GameProgressInterval.tsx";

export default function GameProgressBar({progress, timeString}: {progress: number, timeString: string | null}) {
    let [firstQuarterPct, secondQuarterPct, thirdQuarterPct, fourthQuarterPct] = [0, 0, 0, 0];
    let quarterTimeStatus: GameProgressIntervalStatus = GameProgressIntervalStatus.future;
    let halfTimeStatus: GameProgressIntervalStatus = GameProgressIntervalStatus.future;
    let threeQaurterTimeStatus: GameProgressIntervalStatus = GameProgressIntervalStatus.future;
    let fullTimeStatus: GameProgressIntervalStatus = GameProgressIntervalStatus.future;

    if (progress >= 0) {
        firstQuarterPct = Math.min((progress / 25) * 100, 100);
    }
    if (progress >= 25) {
        secondQuarterPct = Math.min(((progress - 25) / 25) * 100, 100);
        if (timeString === "1/4 Time") {
            quarterTimeStatus = GameProgressIntervalStatus.current;
        } else {
            quarterTimeStatus = GameProgressIntervalStatus.past;
        }
    }
    if (progress >= 50) {
        thirdQuarterPct = Math.min(((progress - 50) / 25) * 100, 100);
        if (timeString === "1/2 Time") {
            halfTimeStatus = GameProgressIntervalStatus.current;
        } else {
            halfTimeStatus = GameProgressIntervalStatus.past;
        }
    }
    if (progress >= 75) {
        fourthQuarterPct = Math.min(((progress - 75) / 25) * 100, 100);
        if (timeString === "3/4 Time") {
            threeQaurterTimeStatus = GameProgressIntervalStatus.current;
        } else {
            threeQaurterTimeStatus = GameProgressIntervalStatus.past;
        }
    }
    if (progress >= 100) {
        if (timeString === "Full Time") {
            fullTimeStatus = GameProgressIntervalStatus.current;
        }
    }

    return (
        <div className={"rounded-lg p-1 bg-mist-700 dark:bg-mist-900"}>
            <div
                className={"game-progress-bar hidden md:grid gap-1 h-4 w-full  items-center justify-items-center mb-1 overflow-hidden mt-1"}
                aria-hidden={true}>
                <GameProgressInterval label={"PG"} status={GameProgressIntervalStatus.past}/>
                <GameProgressSegment progress={firstQuarterPct}/>
                <GameProgressInterval label={"QT"} status={quarterTimeStatus}/>
                <GameProgressSegment progress={secondQuarterPct}/>
                <GameProgressInterval label={"HT"} status={halfTimeStatus}/>
                <GameProgressSegment progress={thirdQuarterPct}/>
                <GameProgressInterval label={"3QT"} status={threeQaurterTimeStatus}/>
                <GameProgressSegment progress={fourthQuarterPct}/>
                <GameProgressInterval label={"FT"} status={fullTimeStatus}/>
            </div>
        </div>
    )
}