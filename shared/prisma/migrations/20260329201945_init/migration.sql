-- CreateEnum
CREATE TYPE "FinalType" AS ENUM ('NOT_FINAL', 'MISC_FINAL', 'ELIMINATION_FINAL', 'QUALIFYING_FINAL', 'SEMI_FINAL', 'PRELIMINARY_FINAL', 'GRAND_FINAL');

-- CreateEnum
CREATE TYPE "ScoreEventType" AS ENUM ('HOME_GOAL', 'HOME_BEHIND', 'AWAY_GOAL', 'AWAY_BEHIND');

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "squiggleId" INTEGER NOT NULL,
    "awayTeamId" UUID,
    "homeTeamId" UUID,
    "winnerTeamId" UUID,
    "unixTime" INTEGER NOT NULL,
    "localTime" TIMESTAMP(3) NOT NULL,
    "updatedTime" TIMESTAMP(3) NOT NULL,
    "gmtOffset" INTEGER NOT NULL,
    "hScore" INTEGER NOT NULL,
    "hGoals" INTEGER NOT NULL,
    "hBehinds" INTEGER NOT NULL,
    "aScore" INTEGER NOT NULL,
    "aGoals" INTEGER NOT NULL,
    "aBehinds" INTEGER NOT NULL,
    "timeString" TEXT,
    "venue" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "roundId" UUID NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "isPremSeason" BOOLEAN NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonTeam" (
    "seasonId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "squiggleTeamId" INTEGER NOT NULL,

    CONSTRAINT "SeasonTeam_pkey" PRIMARY KEY ("seasonId","teamId")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "roundNumber" INTEGER NOT NULL,
    "seasonId" UUID NOT NULL,
    "finalType" "FinalType" NOT NULL DEFAULT 'NOT_FINAL',

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standing" (
    "teamId" UUID NOT NULL,
    "roundId" UUID NOT NULL,
    "seasonId" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "pointsFor" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "behindsFor" INTEGER NOT NULL,
    "pointsAgainst" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "behindsAgainst" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "premPoints" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "played" INTEGER NOT NULL,

    CONSTRAINT "Standing_pkey" PRIMARY KEY ("teamId","roundId","seasonId")
);

-- CreateTable
CREATE TABLE "ScoreEvent" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "type" "ScoreEventType" NOT NULL,
    "timeString" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "gameProgress" INTEGER NOT NULL,

    CONSTRAINT "ScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "sourceName" TEXT NOT NULL,
    "tipTeamId" UUID NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "error" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "bits" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_squiggleId_key" ON "Game"("squiggleId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonTeam" ADD CONSTRAINT "SeasonTeam_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonTeam" ADD CONSTRAINT "SeasonTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tipTeamId_fkey" FOREIGN KEY ("tipTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
