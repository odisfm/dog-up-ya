import './GameSummaryScore.css'

export default function GameSummaryScore({score, margin, goals, behinds}:
                                         { score: number, margin: number, goals: number, behinds: number }) {
    const winning = margin > 0
    return (
        <div className={`game-summary-score h-full gap-2`}>
            <span className={"self-end"}>{`${goals}.${behinds}`}</span>
            <span className={`text-3xl md:text-4xl self-center font-bold`}>{score}</span>
            { winning ?
                <span className={`self-start rounded-md px-3 py-0 font-bold text-xs text-white bg-cyan-600 justify-self-center`}>
                    {`+${margin}`}
                </span>
                :
                <span></span>
            }
        </div>

    )
}