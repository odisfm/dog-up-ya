import {LiaFootballBallSolid} from "react-icons/lia";

export default function Loading() {
    return (
        <div className={"container w-full flex items-center justify-center h-[60vh]"}>
            <div className={"animate-bounce "}>
                <LiaFootballBallSolid
                    className={"text-mist-700 dark:text-mist-400 text-[10rem] animate-spin origin-[48%_52%]"}/>
            </div>
        </div>
    )
}