import type {GameProgressIntervalStatus} from "./GameProgressIntervalStatus.tsx";

export default function GameProgressInterval({label, status}: {label: string, status: GameProgressIntervalStatus}) {
    let bgColors: string;
    switch (status) {
        case "future":
            bgColors = `bg-mist-950`
            break;
        case "current":
            bgColors = `bg-cyan-600`
            break;
        case "past":
            bgColors = `bg-cyan-900`
            break;
    }

    return (
        <div className={`rounded-full text-xs  font-bold max-h-full px-2 ${bgColors}`}>
            {label}
        </div>
    )
}