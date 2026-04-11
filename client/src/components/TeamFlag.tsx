import adelaideFlag from "../assets/flags/adelaide.png?url"
import brisbaneBearsFlag from "../assets/flags/brisbane-bears.png?url"
import brisbaneLionsFlag from "../assets/flags/brisbane-lions.png?url"
import carltonFlag from "../assets/flags/carlton.png?url"
import collingwoodFlag from "../assets/flags/collingwood.png?url"
import essendonFlag from "../assets/flags/essendon.png?url"
import fitzroyFlag from "../assets/flags/fitzroy.png?url"
import fremantleFlag from "../assets/flags/fremantle.png?url"
import geelongFlag from "../assets/flags/geelong.png?url"
import goldCoastFlag from "../assets/flags/gold-coast.png?url"
import greaterWesternSydneyFlag from "../assets/flags/greater-western-sydney.png?url"
import hawthornFlag from "../assets/flags/hawthorn.png?url"
import melbourneFlag from "../assets/flags/melbourne.png?url"
import northMelbourneFlag from "../assets/flags/north-melbourne.png?url"
import portAdelaideFlag from "../assets/flags/port-adelaide.png?url"
import richmondFlag from "../assets/flags/richmond.png?url"
import southMelbourneFlag from "../assets/flags/south-melbourne.png?url"
import stKildaFlag from "../assets/flags/st-kilda.png?url"
import sydneyFlag from "../assets/flags/sydney.png?url"
import universityFlag from "../assets/flags/university.png?url"
import westCoastFlag from "../assets/flags/west-coast.png?url"
import westernBulldogsFlag from "../assets/flags/western-bulldogs.png?url"

import tbdFlag from "../assets/flags/tbd.png?url"

import flagTexture from "../assets/flag-texture.png"

const FLAGS: Record<string, string> = {
    adelaide: adelaideFlag,
    "brisbane-bears": brisbaneBearsFlag,
    "brisbane": brisbaneLionsFlag,
    carlton: carltonFlag,
    collingwood: collingwoodFlag,
    essendon: essendonFlag,
    fitzroy: fitzroyFlag,
    footscray: westernBulldogsFlag,
    fremantle: fremantleFlag,
    geelong: geelongFlag,
    "gold-coast": goldCoastFlag,
    "gws": greaterWesternSydneyFlag,
    hawthorn: hawthornFlag,
    melbourne: melbourneFlag,
    "north-melbourne": northMelbourneFlag,
    "port-adelaide": portAdelaideFlag,
    richmond: richmondFlag,
    "south-melbourne": southMelbourneFlag,
    "st-kilda": stKildaFlag,
    sydney: sydneyFlag,
    university: universityFlag,
    "west-coast": westCoastFlag,
    "western-bulldogs": westernBulldogsFlag,
    "tbd": tbdFlag
}

export default function TeamFlag({teamName, size}: {teamName: keyof typeof FLAGS, size: "xs" | "sm" | "md" | "lg" | "xl" | "sm-md" | "xs-sm"}) {
    const src = FLAGS[teamName.toLowerCase().replace(/ /g, '-')]
    let height;
    let width;

    switch (size) {
        case "xs":
            height = "h-[12px]";
            width = "w-[18px]";
            break;
        case "sm":
            height = "h-[36px]";
            width = "w-[48px]";
            break;
        case "md":
            height = "h-[54px]";
            width = "w-[72px]";
            break;
        case "lg":
            height = "h-[100px]";
            width = "w-[150px]";
            break;
        case "xl":
            height = "h-[200px]";
            width = "w-[300px]";
            break;
        case "sm-md":
            height = "h-[36px] md:h-[48px]";
            width = "w-[54px] md:w-[72px]";
            break;
        case "xs-sm":
            height = "h-[12px] md:h-[36px]";
            width = "w-[18px] md:w-[48px]";
            break;



    }

    const altText = `Flag of ${teamName} football club`

    return (
        <div aria-hidden={true} role={"img"} className={`${height} ${width} relative overflow-clip ${size !== "xs" ? `border-2` : `border-1`} border-mist-300 dark:border-mist-700`}>
            <img src={src} alt={altText} className="absolute inset-0 w-full h-full object-cover" />
            <img src={flagTexture} className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none" alt={""}/>

        </div>
    )

}