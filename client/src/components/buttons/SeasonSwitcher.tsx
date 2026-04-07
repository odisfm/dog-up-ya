import {useContext, useEffect, useRef, useState} from "react";
import {TimeContext} from "../../contexts/TimeProvider.tsx";
import {FIRST_SEASON} from "../../consts.ts";

export default function SeasonSwitcher() {
        const minYear = FIRST_SEASON
        const maxYear = new Date().getFullYear()
        const [seasonInputVisible, setSeasonInputVisible] = useState(false)
        const seasonInputRef = useRef<HTMLInputElement>(null)
        const incrementButtonStyles = `cursor-pointer py-1 px-2 bg-mist-700 hover:bg-mist-600 font-bold text-white rounded-lg`
        const limitButtonStyles = `pointer-events-none cursor-not-allowed bg-black`
        const timeContext = useContext(TimeContext)!

        useEffect(() => {
            if (seasonInputVisible && seasonInputRef.current) {
                seasonInputRef.current.focus()
            }
        }, [seasonInputVisible])

        function activateSeasonInput() {
            setSeasonInputVisible(true)
        }

        function submitSeasonInputForm(event: SubmitEvent) {
            event.preventDefault()
            if (seasonInputRef.current) {
                timeContext.setYear(Number(seasonInputRef.current.value))
            }
            setSeasonInputVisible(false)
        }

        return (
            <div className={"flex gap-2 items-center"}>
                { !seasonInputVisible &&
                    <button className={`${incrementButtonStyles} ${timeContext.year <= minYear && limitButtonStyles}`} onClick={() => timeContext.setYear(timeContext.year - 1)}>{"<"}</button>
                }
                { !seasonInputVisible &&
                    <button
                        className={"px-3 py-1 bg-mist-700 hover:bg-cyan-700 text-white rounded-lg cursor-pointer"}
                        onClick={() => activateSeasonInput()}
                    >
                        {timeContext.year}
                    </button>
                }
                {seasonInputVisible &&
                    <form
                        className={"w-full flex gap-1 p-1 bg-mist-800 rounded-md"}
                        onSubmit={(e) => submitSeasonInputForm(e)}
                    >
                        <input type={"number"} min={minYear} max={maxYear} ref={seasonInputRef} className={"w-15 text-white"} placeholder={String(timeContext.year)}></input>
                        <button className={"px-2 py-1 rounded-lg bg-lime-600"} type={"submit"}>Go</button>
                    </form>
                }
                { !seasonInputVisible &&
                    <button className={`${incrementButtonStyles} ${timeContext.year >= maxYear && limitButtonStyles}`} onClick={() => timeContext.setYear(timeContext.year + 1)}>{">"}</button>
                }
            </div>
        )

}