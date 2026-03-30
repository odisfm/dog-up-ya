import {Outlet} from "react-router";

function App() {



    return (
        <>
            <div className={"bg-stone-100 flex flex-col items-center justify-center flex-1"}>
                <h1 className={"text-purple-500 text-5xl"}>Hello</h1>

                <Outlet />
            </div>
        </>
    )
}

export default App
