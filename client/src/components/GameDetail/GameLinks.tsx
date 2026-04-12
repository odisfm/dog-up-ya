import type {GameLinks} from "@footy-scores/shared";
import LinkButton from "../buttons/LinkButton.tsx";
import Section from "../Section.tsx";

export default function GameLinks({linkData}: {linkData: GameLinks}) {

    if (!linkData.aflTables) {
        return null;
    }

    return (
        <>
            <Section title={"Links"} headingLevel={3} collapsible={false} >
                <div className="flex flex-wrap gap-2">
                    {linkData.aflTables &&
                        <LinkButton url={linkData.aflTables} label={"Stats (AFLTables.com)"} size={"md"}/>
                    }
                </div>
            </Section>
        </>
    )
}