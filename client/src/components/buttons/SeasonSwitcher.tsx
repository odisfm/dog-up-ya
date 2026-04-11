import {useContext, useEffect, useRef, useState} from "react";
import {TimeContext} from "../../contexts/TimeProvider.tsx";
import {FIRST_SEASON} from "../../consts.ts";
import { GrReturn } from "react-icons/gr";
import { MdCancel, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import {ViewContext} from "../../contexts/ViewProvider.tsx";
import type {SubmitEvent} from "react";


export default function SeasonSwitcher() {
        const [seasonInputVisible, setSeasonInputVisible] = useState(false)
        const seasonInputRef = useRef<HTMLInputElement>(null)
        const incrementButtonStyles = `cursor-pointer py-1 px-2 font-bold text-white rounded-lg text-sm`
        const incrementButtonBg = `bg-mist-700 hover:bg-mist-600`
        const limitButtonStyles = `pointer-events-none cursor-not-allowed bg-black`
        const formButtonStyles = `text-white px-2 py-1 rounded-lg cursor-pointer`
        const timeContext = useContext(TimeContext)!
        const viewContext = useContext(ViewContext)!
        const minYear = FIRST_SEASON
        const maxYear = timeContext.latestYear

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
            viewContext.setSidebarActive(false)
        }

        return (
            <>
                { timeContext.latestYear &&
                    <div
                    className={"flex gap-1 items-center"}
                    aria-label={`season selector, current season: ${timeContext.year!}`}
                >
                    {!seasonInputVisible && timeContext.year &&
                        <button
                            className={`${timeContext.year <= minYear ? limitButtonStyles : incrementButtonBg} ${incrementButtonStyles} `}
                            onClick={() => timeContext.setYear(timeContext.year! - 1)}
                            aria-label={`show season ${timeContext.year! - 1}`}
                            aria-disabled={timeContext.year <= minYear}
                        >
                            <MdNavigateBefore aria-hidden={true}/>
                        </button>
                    }
                    {!seasonInputVisible &&
                        <button
                            className={"px-3 py-1 bg-mist-700 hover:bg-cyan-700 text-white rounded-lg cursor-pointer text-xs font-bold"}
                            onClick={() => activateSeasonInput()}
                            aria-label={"go to particular season"}
                        >
                            {timeContext.year}
                        </button>
                    }
                    {seasonInputVisible &&
                        <>
                            <form
                                className={"w-full flex gap-1 p-1 bg-mist-800 rounded-md text-xs"}
                                onSubmit={(e) => submitSeasonInputForm(e)}
                            >
                                <input
                                    type={"number"} min={minYear} max={maxYear}
                                    defaultValue={timeContext.year || maxYear}
                                    ref={seasonInputRef} className={"w-15 text-white"}
                                    placeholder={String(timeContext.year)}
                                    aria-label={"season input"}
                                ></input>
                                <button
                                    className={`${formButtonStyles} bg-lime-600 hover:bg-lime-700`} type={"submit"}
                                    aria-label={"submit season input"}
                                >
                                    <GrReturn/>
                                </button>
                                <button
                                    className={`${formButtonStyles} bg-red-950 hover:bg-red-900`} type={"button"}
                                    onClick={() => setSeasonInputVisible(false)}
                                    aria-label={"dismiss season input"}
                                >
                                    <MdCancel/>
                                </button>
                            </form>
                        </>
                    }
                    {!seasonInputVisible && timeContext.year &&
                        <button
                            className={`${timeContext.year >= maxYear ? limitButtonStyles : incrementButtonBg} ${incrementButtonStyles} `}
                            onClick={() => timeContext.setYear(timeContext.year! + 1)}
                            aria-label={`show season ${timeContext.year! + 1}`}
                            aria-disabled={timeContext.year >= maxYear}
                        >
                            <MdNavigateNext aria-hidden={true}/>
                        </button>
                    }
                </div>
                }
            </>
        )

}