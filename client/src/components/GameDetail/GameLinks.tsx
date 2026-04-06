import type {GameLinks} from "@footy-scores/shared";
import LinkButton from "../LinkButton.tsx";
import Section from "../Section.tsx";

export default function GameLinks({linkData}: {linkData: GameLinks}) {

    return (
        <>
            <Section title={"Links"} headingLevel={3} collapsible={false} >
                <div className="flex flex-wrap gap-2">
                    {linkData.redditAflMatchThread &&
                        <LinkButton url={linkData.redditAflMatchThread} label={"r/afl match thread"} size={"md"}/>
                    }
                    {linkData.redditAflPostMatchThread &&
                        <LinkButton url={linkData.redditAflPostMatchThread} label={"r/afl post-match thread"} size={"md"}/>
                    }
                </div>
            </Section>
        </>
    )
}