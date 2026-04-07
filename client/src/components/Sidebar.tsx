import SeasonSwitcher from "./buttons/SeasonSwitcher.tsx";

export default function Sidebar({ visible }: { visible: boolean }) {

    const labelStyles = `text-left font-bold mb-2`
    return (
        <div
            style={{
                transform: visible ? "translateX(0)" : "translateX(100%)",
                transition: "transform 100ms ease-in-out",
            }}
            className="absolute top-0 right-0 h-full w-screen md:w-2/3 lg:w-1/3 z-50 bg-mist-900 dark:bg-black text-white flex flex-col"
        >
            <div className="flex flex-col items-start flex-1 w-full p-3 overflow-y-scroll pb-12">
                <h3 className={"text-xl font-bold mb-4"}>Options</h3>
                <fieldset className={`md:hidden flex flex-col`}>
                    <label htmlFor={"sidebarSeasonSwitcher"} className={labelStyles}>Season</label>
                    <div id={"sidebarSeasonSwitcher"}>
                        <SeasonSwitcher current={2026} min={1897} max={2026} decrementSeason={console.log} incrementSeason={console.log}/>
                    </div>
                </fieldset>
            </div>
        </div>
    );
}