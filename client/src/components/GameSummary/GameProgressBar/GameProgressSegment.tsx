export default function GameProgressSegment({progress}: {progress: number}) {
    const widthPct = `${progress}%`;
    console.log(`widthPct: ${widthPct}`);
    return (
        <div className={"w-full h-3/5 flex bg-cyan-800 rounded-md"}>
            <div className={"game-progress-segment-inner self-start bg-cyan-600 h-full rounded-md"} style={{width: widthPct}} />
        </div>
    )
}