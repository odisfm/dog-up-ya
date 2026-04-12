import {FaExternalLinkAlt, FaWikipediaW} from "react-icons/fa";

export default function WikiButton({url, label}: {url: string, label: string}) {
    return (
        <a
            href={url}
            className={"px-2 py-1 cursor-pointer rounded-md bg-mist-500 hover:bg-mist-600 dark:bg-mist-700 dark:hover:bg-mist-600 " +
                "self-start text-white flex gap-2 items-center"}
            target={"_blank"}
        >
            <FaWikipediaW/> <FaExternalLinkAlt
            className={"text-xs"}/><span>{label}</span>
        </a>
    )
}