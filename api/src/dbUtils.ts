import { db } from '@footy-scores/shared'

export async function getSeasonForYear(year: number) {
    return db.season.findFirst({
        where: {
            year: year,
            isPremSeason: true
        }
    });
}