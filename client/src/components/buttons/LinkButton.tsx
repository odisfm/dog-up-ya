import {Link} from "react-router";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function LinkButton({url, label, size}:
                                   { url: string, label: string, size: "sm" | "md" | "lg"}) {
    const commonStyles = "cursor-pointer rounded-md bg-mist-700 dark:bg-mist-900 group-hover:bg-mist-600 group-hover:dark:bg-mist-800 flex gap-2 items-center"
    let sizeStyles = ""
    switch (size) {
        case "sm":
            sizeStyles = "px-2 py-1"
            break;
        case "md":
            sizeStyles = "px-3 py-2 text-lg"
            break;
        case "lg":
            sizeStyles = "px-5 py-3 text-xl"
            break;
    }

    const external = url.startsWith("https://") || url.startsWith("http://")

    return (
        <>
            {external ? (
                <a href={url} className={"group"} target="_blank" rel="noreferrer">
                    <button
                        className={`${sizeStyles} ${commonStyles}`}>
                        {label}
                        <FaExternalLinkAlt className={"text-sm"}/>

                    </button>
                </a>
            ) : (
                <Link to={url} className={"group"}>
                    <button
                        className={`${sizeStyles} ${commonStyles}`}>
                        {label}
                    </button>
                </Link>
            )}
        </>
    )
}