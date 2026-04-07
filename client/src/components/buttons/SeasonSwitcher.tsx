import {useEffect, useRef, useState} from "react";

export default function SeasonSwitcher({current, min, max, decrementSeason, incrementSeason, setSeason}:
    { current: number, min: number, max: number, decrementSeason: Function, incrementSeason: Function, setSeason: Function }) {
        const [seasonInputVisible, setSeasonInputVisible] = useState(false)
        const seasonInputRef = useRef<HTMLInputElement>(null)
        const incrementButtonStyles = `cursor-pointer py-1 px-2 bg-mist-700 hover:bg-mist-600 font-bold text-white rounded-lg`
        const limitButtonStyles = `pointer-events-none cursor-not-allowed bg-black`

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
                setSeason(seasonInputRef.current.value)
            }
            setSeasonInputVisible(false)
        }

        return (
            <div className={"flex gap-2 items-center"}>
                { !seasonInputVisible &&
                    <button className={`${incrementButtonStyles} ${current <= min && limitButtonStyles}`} onClick={() => decrementSeason()}>{"<"}</button>
                }
                { !seasonInputVisible &&
                    <button
                        className={"px-3 py-1 bg-mist-700 hover:bg-cyan-700 text-white rounded-lg cursor-pointer"}
                        onClick={() => activateSeasonInput()}
                    >
                        {current}
                    </button>
                }
                {seasonInputVisible &&
                    <form
                        className={"w-full flex gap-1 p-1 bg-mist-800 rounded-md"}
                        onSubmit={(e) => submitSeasonInputForm(e)}
                    >
                        <input type={"number"} min={min} max={max} ref={seasonInputRef} className={"w-15 text-white"} placeholder={String(current)}></input>
                        <button className={"px-2 py-1 rounded-lg bg-lime-600"} type={"submit"}>Go</button>
                    </form>
                }
                { !seasonInputVisible &&
                    <button className={`${incrementButtonStyles} ${current >= max && limitButtonStyles}`} onClick={() => incrementSeason()}>{">"}</button>
                }
            </div>
        )

}