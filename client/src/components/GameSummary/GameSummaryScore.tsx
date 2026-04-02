import './GameSummaryScore.css'

export default function GameSummaryScore({score, margin, goals, behinds}:
                                         { score: number, margin: number, goals: number, behinds: number }) {
    const winning = margin > 0
    return (
        <div className={`game-summary-score h-full gap-2 justify-items-center`}>
            <span className={"self-end"}>{`${goals}.${behinds}`}</span>
            <span className={`text-3xl md:text-4xl font-bold md:py-1 md:px-5 md:bg-mist-700 md:dark:bg-mist-950 rounded-md`}>{score}</span>
            <span className={`${margin <= 0 && `hidden`} self-start rounded-md px-3 py-0 font-bold text-xs text-white bg-cyan-700 justify-self-center`}>
                {`+${margin}`}
            </span>
        </div>

    )
}