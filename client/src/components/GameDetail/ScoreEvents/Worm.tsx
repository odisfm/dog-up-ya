import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, CartesianGrid } from 'recharts';
import type { ScoreEvent } from "@footy-scores/shared";
import {useContext, useMemo} from "react";
import type {GameResponse} from "@footy-scores/shared/src/types/apiResponses.ts";
import { PrefsContext } from '../../../contexts/PrefsProvider.tsx';
import TeamFlag from "../../TeamFlag.tsx";

export default function Worm({ gameData, scoreEvents, integrity }: {
    gameData: GameResponse,
    scoreEvents: ScoreEvent[],
    integrity: boolean
}) {
    const prefsContext = useContext(PrefsContext)!;
    const data = useMemo(() => {
        const _scoreEvents = scoreEvents.toReversed()
        const result: Record<string, number>[] = [{ x: 0, y: 0 }];
        for (const event of _scoreEvents) {
            result.push({
                x: event.gameProgress,
                y: (event.hScore || 0) - (event.aScore || 0),
            });
        }
        const last = result.at(-1)
        if (last!.x !== 100) {
            result.push({x: gameData.progress, y: last!.y})
        }

        return result;
    }, [scoreEvents, gameData]);

    const teamBoxStyles = `flex flex-col flex-1 font-bold gap-1`

    return (
        <>
            <div className={"rounded-md p-4 bg-mist-600 dark:bg-mist-800 flex flex-col gap-2"} aria-hidden={true}>
                <div className={"flex gap-2"}>
                    <div className={
                        "flex flex-col gap-2 self-stretch justify-items-center text-xs " +
                        "relative bottom-3"
                    }>
                        <div className={`${teamBoxStyles} items-center justify-end`}>
                            <span>{gameData.homeTeam!.abbreviation}</span>
                            <TeamFlag teamName={gameData.homeTeam!.name} size={"xs-sm"}/>
                        </div>
                        <div className={`${teamBoxStyles} items-center justify-start`}>
                            <TeamFlag teamName={gameData.awayTeam!.name} size={"xs-sm"}/>
                            <span>{gameData.awayTeam!.abbreviation}</span>
                        </div>

                    </div>
                    <ResponsiveContainer width="100%" aspect={1.618} maxHeight={200}
                                         className={"pointer-events-none"}>
                        <LineChart data={data}>
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                                tickFormatter={(v: number) => ({
                                    0: '',
                                    25: 'QT',
                                    50: 'HT',
                                    75: '3QT'
                                } as Record<number, string>)[v] ?? ''}
                                style={{fill: "#eee"}}
                            />
                            <YAxis
                                orientation={"right"}
                                style={{fill: "#eee", fontSize: ".8rem"}}
                                domain={([min, max]) => {
                                    const bound = Math.max(Math.abs(min), Math.abs(max));
                                    const symmetricBound = Math.max(bound, 6);
                                    return [-symmetricBound, symmetricBound];
                                }}
                            />
                            <Line dataKey="y" type="stepAfter" dot={false} strokeWidth={3} stroke={"#0092B9"}
                                  isAnimationActive={prefsContext.playAnimations}/>
                            <CartesianGrid vertical={true} horizontal={false} stroke="#888" strokeWidth={0.5}/>
                            <ReferenceLine y={0} stroke="#888" strokeWidth={0.5}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {
                !integrity &&
                <span className={"text-left font-extralight text-sm italic py-1 px-2 mb-2 rounded-md " +
                    "bg-mist-700 dark:bg-mist-900 self-start"}>
                    As some score events are missing, worm is not fully accurate.
                </span>
            }
        </>
    );
}