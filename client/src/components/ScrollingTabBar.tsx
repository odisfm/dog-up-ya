import {Link, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";


export type TabBarItem = {
    label: string,
    accessibleLabel?: string,
    link: string,
}

const scrollDistance = 150

export default function ScrollingTabBar({items, activeItem}: {items: TabBarItem[], activeItem: string | undefined}) {
    const [activeTab, setActiveTab] = useState<HTMLLIElement | null>(null);
    const ulRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        if (activeTab) {
            console.log("scrolling into view")
            activeTab.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            })
        }
    }, [activeTab, setActiveTab])

    const scrollLeft = () => {
        if (ulRef.current) {
            ulRef.current.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (ulRef.current) {
            ulRef.current.scrollBy({ left: scrollDistance, behavior: 'smooth' });
        }
    };

    const scrollButtonClasses = `pointer-coarse:hidden text-mist-500 dark:text-white text-xl p-1 rounded-md hover:bg-white dark:hover:bg-mist-700`


    return (
        <nav className={"flex items-center gap-2 h-20 text-white w-full md:w-4/5 lg:w-2/3 p-1"}>
            <button className={`${scrollButtonClasses}`} onClick={scrollLeft}>
                <FaChevronCircleLeft />
            </button>
            <ul ref={ulRef} className={"flex gap-1 flex-nowrap flex-1 min-w-0 overflow-x-auto overflow-y-hidden text-white *:inline-block scrollbar-hide"}>
                {items.map((item) => {
                    const isActive = item.link === activeItem;
                    return (
                        <li key={item.link}
                            ref={isActive ? setActiveTab : null}
                        >
                            <Link
                                to={item.link}
                                aria-label={item.accessibleLabel}
                                className={`rounded-md py-1 px-2 min-w-15 inline-block whitespace-nowrap  
                                    ${!isActive ? `bg-mist-500 hover:bg-mist-600 dark:bg-mist-900 hover:dark:bg-mist-800`: 
                                    `bg-cyan-700`}`
                            }
                                aria-current={isActive}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <button className={`${scrollButtonClasses}`} onClick={scrollRight}>
                <FaChevronCircleRight />
            </button>
        </nav>
    )
}