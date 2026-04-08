import {FaGithub} from "react-icons/fa";
import {MdEmail} from "react-icons/md";
import {APP_NAME, GITHUB_REPO_LINK, MAILTO_ADDRESS} from "../consts.ts";

export default function Footer() {
    const linkStyles = `group hover:bg-mist-600 hover:dark:bg-mist-700 px-1 md:px-2 py-1 rounded-lg cursor-pointer`
    return (
        <footer className={`
        bg-mist-500 dark:bg-mist-900 
        grid py-3 md:p-6 px-4 md:px-12 items-center
        text-white font-light text-xs md:text-sm`}>
            <div className={"attr-text text-left"}>
                <span>data from <a href={"https://squiggle.com.au/"} target={"_blank"}>Squiggle</a>,
                    site by <a href={"https://odis.fm"} target={"_blank"}>odis</a></span>
            </div>
            <div className={"icons flex gap-1 items-center justify-self-end text-lg"}>
                <a className={`${linkStyles}`} href={`mailto:${MAILTO_ADDRESS}?subject=${encodeURIComponent(APP_NAME)}`} target={"_blank"}>
                    <MdEmail />
                </a>
                <a className={`${linkStyles}`} href={GITHUB_REPO_LINK} target={"_blank"}>
                    <FaGithub/>
                </a>
            </div>
        </footer>
    )
}