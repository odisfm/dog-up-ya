import type {GameLinks} from "@footy-scores/shared";
import LinkButton from "../LinkButton.tsx";

export default function GameLinks({linkData}: {linkData: GameLinks}) {

    return (
        <>
            <h3 className={"mt-3 mb-3 text-xl px-3 py-1 rounded-md bg-mist-700"}>Links</h3>
            <div className="flex flex-wrap gap-2">
                {linkData.redditAflMatchThread &&
                    <LinkButton url={linkData.redditAflMatchThread} label={"r/afl match thread"} size={"md"}/>
                }
                {linkData.redditAflPostMatchThread &&
                    <LinkButton url={linkData.redditAflPostMatchThread} label={"r/afl post-match thread"} size={"md"}/>
                }
            </div>
        </>
    )
}