import {createContext, type ReactNode, useState} from "react";

type View = "round" | "ladder" | "game" | "team"


interface ViewContextType {
    view: View
    setView: (view: View) => void
    sidebarActive: boolean
    setSidebarActive: (sideBarActive: boolean) => void
    toggleSidebar: () => void
}

export const ViewContext = createContext<ViewContextType | null>(null)

export function ViewProvider({children, initialView, initialSidebarActive}:
                             {
                                 children: ReactNode,
                                 initialView: View,
                                 initialSidebarActive: boolean,
                             }) {
    const [view, setView] = useState<View>(initialView)
    const [sidebarActive, setSidebarActive] = useState(initialSidebarActive)
    const toggleSidebar = () => setSidebarActive(!sidebarActive)


    return (
        <ViewContext.Provider value={{view, setView, sidebarActive, setSidebarActive, toggleSidebar}}>
            {children}
        </ViewContext.Provider>
    )

}