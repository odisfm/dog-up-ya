-- CreateTable
CREATE TABLE "GameLinks" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "redditAflMatchThread" TEXT,
    "redditAflPostMatchThread" TEXT,

    CONSTRAINT "GameLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameLinks_gameId_key" ON "GameLinks"("gameId");

-- AddForeignKey
ALTER TABLE "GameLinks" ADD CONSTRAINT "GameLinks_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
