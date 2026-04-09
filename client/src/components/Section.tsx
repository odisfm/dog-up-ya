import {type ReactNode, useState} from "react";
import SectionHeading from "./SectionHeading";
import {FaEye, FaEyeSlash} from "react-icons/fa";

export default function Section({
                                    children,
                                    title,
                                    headingLevel,
                                    collapsible,
                                    role = null,
                                    prefName = null,
                                    collapsedDefault = false,
                                }: {
    children: ReactNode,
    title: string;
    headingLevel: 1 | 2 | 3 | 4 | 5 | 6,
    collapsible: boolean;
    role?: null | string;
    prefName?: null | string;
    collapsedDefault?: boolean;
}) {
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (prefName) {
            const stored = localStorage.getItem(`hide${prefName}`);
            if (stored !== null) return stored === "true";
        }
        return collapsedDefault;
    });

    function toggleCollapsed() {
        const next = !collapsed;
        setCollapsed(next);
        if (prefName) {
            localStorage.setItem(`hide${prefName}`, next ? "true" : "false");
        }
    }
    return (
        <section role={role || ""} className={"w-full"}>
            <div className={"flex gap-2"}>
                <SectionHeading title={title} level={headingLevel}/>
                {
                    collapsible &&
                    <button onClick={toggleCollapsed}
                         className={"cursor-pointer self-center px-3 py-2 rounded-lg bg-mist-600 dark:bg-mist-800 hover:bg-mist-500 dark:hover:bg-mist-500"}>
                    {collapsed ? <FaEye/> : <FaEyeSlash/>}
                </button>
                }
            </div>
            <div className={`${collapsed && `max-h-0 overflow-hidden `} `}>{children}</div>
        </section>
    )
}