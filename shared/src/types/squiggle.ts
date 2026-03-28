export type SquiggleGame = {
    id: number;
    year: number;
    round: number;
    roundname: string;

    hteamid: number;
    hteam: string;
    ateamid: number;
    ateam: string;

    hgoals: number | null;
    hbehinds: number | null;
    hscore: number | null;
    agoals: number | null;
    abehinds: number | null;
    ascore: number | null;

    winner: string | null;
    winnerteamid: number | null;
    /** Integer, 0-100 */
    complete: number;
    is_final: SquiggleIsFinal;
    is_grand_final: 0 | 1;

    venue: string;
    /** Format: "YYYY-MM-DD HH:mm:ss" */
    date: string;
    /** Format: "YYYY-MM-DD HH:mm:ss" */
    localtime: string;
    unixtime: number;
    timestr: string | null;
    tz: string;

    /** Format: "YYYY-MM-DD HH:mm:ss" */
    updated: string;
}

/** 0=not final, 1=unspecified final, 2=elimination final, 3=qualifying final,
 * 4=semi-final, 5=preliminary final, 6=grand final */
export type SquiggleIsFinal = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SquiggleStanding = {
    id: number;
    name: string;
    rank: number;

    played: number;
    wins: number;
    losses: number;
    draws: number;
    /** Premiership points */
    pts: number;

    goals_for: number;
    behinds_for: number;
    /** Points for */
    for: number;
    goals_against: number;
    behinds_against: number;
    /** Points against */
    against: number;
    percentage: number;
}

export type SquiggleTip = {
    gameid: number;
    year: number;
    round: number;
    sourceid: number;
    source: string;

    hteamid: number;
    hteam: string;
    ateamid: number;
    ateam: string;
    venue: string;
    /** Format: "YYYY-MM-DD HH:mm:ss" */
    date: string;

    tip: string;
    tipteamid: number;
    margin: string;
    hmargin: string;
    confidence: string;
    /** `confidence`, but expressed from home team perspective */
    hconfidence: string;

    correct: 0 | 1 | null;
    /** Difference between predicted and actual margin, as positive float */
    err: number | null;
    bits: number | null;

    /** Format: "YYYY-MM-DD HH:mm:ss" */
    updated: string;
}