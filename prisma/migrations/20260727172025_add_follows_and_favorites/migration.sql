-- CreateTable
CREATE TABLE "FanTeamFollow" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanTeamFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanBarFavorite" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanBarFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FanTeamFollow_fanId_teamId_key" ON "FanTeamFollow"("fanId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FanBarFavorite_fanId_barId_key" ON "FanBarFavorite"("fanId", "barId");

-- AddForeignKey
ALTER TABLE "FanTeamFollow" ADD CONSTRAINT "FanTeamFollow_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "Fan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanTeamFollow" ADD CONSTRAINT "FanTeamFollow_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanBarFavorite" ADD CONSTRAINT "FanBarFavorite_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "Fan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanBarFavorite" ADD CONSTRAINT "FanBarFavorite_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
