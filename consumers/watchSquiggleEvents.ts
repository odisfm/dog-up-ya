import 'dotenv/config'
import {EventSource} from "eventsource";
import {PrismaExports, Prisma} from '@footy-scores/shared'
import { db } from '@footy-scores/shared'
import type {SquiggleEventGame, SquiggleEventScore, SquiggleEventTime, SquiggleEventProgress} from "@footy-scores/shared";

const args: string[] = process.argv.slice(2)
const TEST_MODE = args.includes("test")

const url = TEST_MODE ? "https://sse.squiggle.com.au/test" : "https://sse.squiggle.com.au/events";
const es = new EventSource(url, {
    fetch: (input, init) =>
        fetch(input, {
            headers: {
                "User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE
            },
        }),
});


es.addEventListener('open', () => console.log('SSE connection opened'));
es.addEventListener('error', (e) => console.error('SSE error:', e));


es.addEventListener('score', async (event) => {
    const data: SquiggleEventScore = JSON.parse(event.data);
    console.log(`got score event`, data)
    if (TEST_MODE) {
        console.log('Got score event', data)
        return
    }
    let gameRecord: GamePayload;
    try {
        gameRecord = await getGameRecord(data.gameid)
    } catch (error) {
        console.error(error);
        console.error(`Game with Squiggle ID ${data.gameid} is not in DB!!!`)
    }
    let scoreType: PrismaExports.ScoreEventType;
    if (data.side === "hteam") {
        if (data.type === "goal") {
            scoreType = "HOME_GOAL"
        } else {
            scoreType = "HOME_BEHIND"
        }
    } else {
        if (data.type === "goal") {
            scoreType = "AWAY_GOAL"
        } else {
            scoreType = "AWAY_BEHIND"
        }
    }

    await db.game.update({
        where: {
            squiggleId: data.gameid
        },
        data: {
            hScore: data.score.hscore,
            hGoals: data.score.hgoals,
            hBehinds: data.score.hbehinds,
            aScore: data.score.ascore,
            aGoals: data.score.agoals,
            aBehinds: data.score.abehinds,
            progress: data.complete,
            timeString: data.timestr,
        }
    })

    await db.scoreEvent.create({
        data: {
            gameId: gameRecord.id,
            type: scoreType,
            timeString: data.timestr,
            time: new Date(),
            gameProgress: data.complete,
            hScore: data.score.hscore,
            hGoals: data.score.hgoals,
            hBehinds: data.score.hbehinds,
            aScore: data.score.ascore,
            aGoals: data.score.agoals,
            aBehinds: data.score.abehinds,
        }
    })

})

es.addEventListener('game', async (event) => {
    const data: SquiggleEventGame = JSON.parse(event.data);
    console.log(`got game event`, data)
    if (TEST_MODE) {
        console.log('Got score event', data)
        return
    }
    let gameRecord: GamePayload;
    try {
        gameRecord = await getGameRecord(data.id)
    } catch (error) {
        console.error(error);
        console.error(`Game with Squiggle ID ${data.id} is not in DB!!!`)
    }
    let winnerTeamId: undefined | string = undefined;
    if (data.winner) {
        const winnerSeasonTeam = await db.seasonTeam.findFirst({
            where: {
                seasonId: gameRecord.round.seasonId,
                squiggleTeamId: data.winner
            },
            include: {
                team: true
            }
        })
        winnerTeamId = winnerSeasonTeam.team.id
    }

    db.game.update({
        where: {
            squiggleId: data.id
        },
        data: {
            progress: data.complete,
            winnerTeamId: winnerTeamId,
            hScore: data.hscore,
            hGoals: data.hgoals,
            hBehinds: data.hbehinds,
            aScore: data.ascore,
            aGoals: data.agoals,
            aBehinds: data.abehinds,
            timeString: data.timestr,
        }
    })
})

es.addEventListener('complete', async (event) => {
    const data: SquiggleEventProgress = JSON.parse(event.data);
    console.log(`got progress event`, data)
    if (TEST_MODE) {
        console.log('Got progress event', data)
        return
    }
    await db.game.update({
        where: {
            squiggleId: data.gameid
        },
        data: {
            progress: data.complete,
        }
    })

})

es.addEventListener('timestr', async (event) => {
    const data: SquiggleEventTime = JSON.parse(event.data);
    console.log(`got time event`, data)
    if (TEST_MODE) {
        console.log('Got time event', data)
        return
    }
    await db.game.update({
        where: {
            squiggleId: data.gameid
        },
        data: {
            timeString: data.timestr,
        }
    })
})


type GamePayload = Prisma.GameGetPayload<{
    include: {
        homeTeam: true
        awayTeam: true
        round: true
    }
}>

async function getGameRecord(squiggleId: number): Promise<GamePayload> {
    console.log(`Getting game record for ${squiggleId}`)
    const record = await db.game.findUniqueOrThrow({
        where: {
            squiggleId: squiggleId
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            round: true
        }
    })
    return record;
}


console.log(`listening`)

const keepAlive = setInterval(() => {}, 1 << 30);

process.on('SIGINT', () => {
    es.close();
    clearInterval(keepAlive);
    process.exit(0);
});