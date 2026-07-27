-- CreateTable
CREATE TABLE "WatchParty" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdByFanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "watchPartyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchParty_city_dateTime_idx" ON "WatchParty"("city", "dateTime");

-- CreateIndex
CREATE INDEX "WatchParty_teamId_idx" ON "WatchParty"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_fanId_watchPartyId_key" ON "RSVP"("fanId", "watchPartyId");

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_createdByFanId_fkey" FOREIGN KEY ("createdByFanId") REFERENCES "Fan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "Fan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_watchPartyId_fkey" FOREIGN KEY ("watchPartyId") REFERENCES "WatchParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
