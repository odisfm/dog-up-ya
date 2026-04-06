import type {GameLinks} from "@footy-scores/shared";
import LinkButton from "../LinkButton.tsx";
import SectionHeading from "../SectionHeading.tsx";

export default function GameLinks({linkData}: {linkData: GameLinks}) {

    return (
        <>
            <SectionHeading title={"Links"} level={3}/>
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