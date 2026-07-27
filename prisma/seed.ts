import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITY = "Chicago";

const teams = [
  { name: "Michigan State Spartans", sport: "Football", league: "NCAA" },
  { name: "Michigan Wolverines", sport: "Football", league: "NCAA" },
  { name: "Wisconsin Badgers", sport: "Football", league: "NCAA" },
  { name: "Notre Dame Fighting Irish", sport: "Football", league: "NCAA" },
  { name: "Green Bay Packers", sport: "Football", league: "NFL" },
  { name: "Chicago Bears", sport: "Football", league: "NFL" },
  { name: "Michigan State Spartans", sport: "Basketball", league: "NCAA" },
  { name: "Duke Blue Devils", sport: "Basketball", league: "NCAA" },
  { name: "Chicago Bulls", sport: "Basketball", league: "NBA" },
] as const;

const bars = [
  {
    key: "kirkwood",
    name: "Kirkwood Bar & Grill",
    address: "1631 W Diversey Pkwy, Chicago, IL",
    lat: 41.9322,
    lng: -87.6664,
    tvCount: 14,
    soundPolicy: "Audio on request for big games",
    capacity: 150,
  },
  {
    key: "globe",
    name: "The Globe Pub",
    address: "1934 W Irving Park Rd, Chicago, IL",
    lat: 41.9542,
    lng: -87.6789,
    tvCount: 20,
    soundPolicy: "Team audio prioritized on request",
    capacity: 180,
  },
  {
    key: "trinity",
    name: "Trinity Bar",
    address: "2721 N Halsted St, Chicago, IL",
    lat: 41.9296,
    lng: -87.6489,
    tvCount: 10,
    soundPolicy: "TVs muted, jukebox on",
    capacity: 90,
  },
  {
    key: "fatpour",
    name: "Fatpour Tap Works",
    address: "616 N Fairbanks Ct, Chicago, IL",
    lat: 41.8944,
    lng: -87.6208,
    tvCount: 25,
    soundPolicy: "Audio on request",
    capacity: 220,
  },
  {
    key: "oldcrow",
    name: "Old Crow Smokehouse",
    address: "149 W Kinzie St, Chicago, IL",
    lat: 41.8894,
    lng: -87.6328,
    tvCount: 18,
    soundPolicy: "Rooftop speakers for big games",
    capacity: 200,
  },
  {
    key: "bernies",
    name: "Bernie's Lakeview",
    address: "3664 N Clark St, Chicago, IL",
    lat: 41.9479,
    lng: -87.6584,
    tvCount: 16,
    soundPolicy: "Audio on request",
    capacity: 160,
  },
  {
    key: "vinegoose",
    name: "Vine & Goose",
    address: "2261 W Chicago Ave, Chicago, IL",
    lat: 41.8958,
    lng: -87.6839,
    tvCount: 8,
    soundPolicy: "TVs muted, low-key vibe",
    capacity: 70,
  },
  {
    key: "mahoneys",
    name: "Mahoney's Pub & Grille",
    address: "551 N Ogden Ave, Chicago, IL",
    lat: 41.8929,
    lng: -87.6647,
    tvCount: 12,
    soundPolicy: "Audio on request",
    capacity: 110,
  },
  {
    key: "irishoak",
    name: "The Irish Oak",
    address: "3511 N Clark St, Chicago, IL",
    lat: 41.9457,
    lng: -87.6583,
    tvCount: 15,
    soundPolicy: "Team audio prioritized on request",
    capacity: 140,
  },
  {
    key: "totooles",
    name: "Timothy O'Toole's Pub",
    address: "622 N Fairbanks Ct, Chicago, IL",
    lat: 41.8947,
    lng: -87.6206,
    tvCount: 22,
    soundPolicy: "Audio on request",
    capacity: 190,
  },
  {
    key: "lodge",
    name: "The Lodge Tavern",
    address: "21 W Division St, Chicago, IL",
    lat: 41.9037,
    lng: -87.6288,
    tvCount: 9,
    soundPolicy: "TVs muted, jukebox on",
    capacity: 80,
  },
  {
    key: "emeraldloop",
    name: "Emerald Loop Bar & Grill",
    address: "216 N Wabash Ave, Chicago, IL",
    lat: 41.8862,
    lng: -87.6262,
    tvCount: 17,
    soundPolicy: "Audio on request",
    capacity: 170,
  },
  {
    key: "sluggers",
    name: "Sluggers World Class Sports Bar",
    address: "3540 N Clark St, Chicago, IL",
    lat: 41.9468,
    lng: -87.6588,
    tvCount: 30,
    soundPolicy: "Audio on request",
    capacity: 250,
  },
  {
    key: "docs",
    name: "Doc's Sports Bar",
    address: "6234 N Clark St, Chicago, IL",
    lat: 41.9958,
    lng: -87.6698,
    tvCount: 13,
    soundPolicy: "Audio on request",
    capacity: 120,
  },
  {
    key: "frunchroom",
    name: "The Frunchroom",
    address: "10063 S Western Ave, Chicago, IL",
    lat: 41.7130,
    lng: -87.6819,
    tvCount: 6,
    soundPolicy: "TVs muted, low-key vibe",
    capacity: 60,
  },
  {
    key: "barchicago",
    name: "Bar Chicago",
    address: "9 W Hubbard St, Chicago, IL",
    lat: 41.8901,
    lng: -87.6285,
    tvCount: 11,
    soundPolicy: "Audio on request",
    capacity: 130,
  },
  {
    key: "wickerparktavern",
    name: "Wicker Park Tavern",
    address: "1958 W North Ave, Chicago, IL",
    lat: 41.9104,
    lng: -87.6773,
    tvCount: 9,
    soundPolicy: "TVs muted, jukebox on",
    capacity: 100,
  },
  {
    key: "logansquaretap",
    name: "Logan Square Tap",
    address: "2503 W Fullerton Ave, Chicago, IL",
    lat: 41.9247,
    lng: -87.6903,
    tvCount: 7,
    soundPolicy: "TVs muted, low-key vibe",
    capacity: 75,
  },
] as const;

// [team name, sport, bar key, verification count]
const links: Array<[string, string, string, number]> = [
  ["Michigan State Spartans", "Football", "kirkwood", 14],
  ["Michigan State Spartans", "Football", "globe", 4],
  ["Michigan State Spartans", "Football", "trinity", 1],

  ["Michigan Wolverines", "Football", "fatpour", 11],
  ["Michigan Wolverines", "Football", "oldcrow", 5],
  ["Michigan Wolverines", "Football", "bernies", 2],

  ["Wisconsin Badgers", "Football", "globe", 16],
  ["Wisconsin Badgers", "Football", "vinegoose", 6],
  ["Wisconsin Badgers", "Football", "mahoneys", 1],

  ["Notre Dame Fighting Irish", "Football", "irishoak", 20],
  ["Notre Dame Fighting Irish", "Football", "totooles", 7],
  ["Notre Dame Fighting Irish", "Football", "lodge", 2],

  ["Green Bay Packers", "Football", "bernies", 13],
  ["Green Bay Packers", "Football", "kirkwood", 3],
  ["Green Bay Packers", "Football", "sluggers", 1],

  ["Chicago Bears", "Football", "emeraldloop", 15],
  ["Chicago Bears", "Football", "totooles", 9],
  ["Chicago Bears", "Football", "docs", 2],
  ["Chicago Bears", "Football", "sluggers", 0],

  ["Michigan State Spartans", "Basketball", "kirkwood", 5],
  ["Michigan State Spartans", "Basketball", "globe", 1],

  ["Duke Blue Devils", "Basketball", "lodge", 12],
  ["Duke Blue Devils", "Basketball", "fatpour", 3],

  ["Chicago Bulls", "Basketball", "emeraldloop", 8],
  ["Chicago Bulls", "Basketball", "frunchroom", 1],
  ["Chicago Bulls", "Basketball", "oldcrow", 0],
];

const sampleNotes = [
  "Great crowd for the game, tons of gear in the room.",
  "Bartender put the game on the big screen without asking twice.",
  "Small but loud group of fans here every week.",
  null,
  null,
  "Alumni chapter watch party spot.",
  "Good sound, easy to hear the broadcast.",
  null,
];

interface WatchPartySeed {
  teamName: string;
  sport: string;
  barKey: string;
  daysOffset: number; // negative = past, positive = future
  hour: number;
  note: string | null;
  hostFanIndex: number;
  rsvpFanIndices: number[]; // additional attendees beyond the host (who auto-RSVPs)
}

const watchParties: WatchPartySeed[] = [
  // Upcoming
  {
    teamName: "Michigan State Spartans",
    sport: "Football",
    barKey: "kirkwood",
    daysOffset: 3,
    hour: 15,
    note: "vs Michigan, watching in the back room",
    hostFanIndex: 0,
    rsvpFanIndices: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    teamName: "Notre Dame Fighting Irish",
    sport: "Football",
    barKey: "irishoak",
    daysOffset: 6,
    hour: 19,
    note: "Primetime game, arrive early for seats",
    hostFanIndex: 2,
    rsvpFanIndices: [3, 4],
  },
  {
    teamName: "Chicago Bulls",
    sport: "Basketball",
    barKey: "emeraldloop",
    daysOffset: 10,
    hour: 18,
    note: null,
    hostFanIndex: 5,
    rsvpFanIndices: [],
  },
  {
    // Deliberately > 20 attendees to exercise the "show count, not names" path
    teamName: "Green Bay Packers",
    sport: "Football",
    barKey: "bernies",
    daysOffset: 1,
    hour: 12,
    note: "Sunday early game, doors open at 11",
    hostFanIndex: 20,
    rsvpFanIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  },

  // Past
  {
    teamName: "Michigan Wolverines",
    sport: "Football",
    barKey: "fatpour",
    daysOffset: -5,
    hour: 15,
    note: "vs Wisconsin",
    hostFanIndex: 3,
    rsvpFanIndices: [0, 1, 2],
  },
  {
    teamName: "Duke Blue Devils",
    sport: "Basketball",
    barKey: "lodge",
    daysOffset: -10,
    hour: 20,
    note: null,
    hostFanIndex: 6,
    rsvpFanIndices: [7, 8],
  },
  {
    teamName: "Wisconsin Badgers",
    sport: "Football",
    barKey: "globe",
    daysOffset: -20,
    hour: 12,
    note: "Rivalry week watch party",
    hostFanIndex: 1,
    rsvpFanIndices: [0, 2, 3, 4],
  },
];

function offsetDate(daysOffset: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function randomPastDate(maxDaysAgo: number): Date {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 12) + 10, Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.verification.deleteMany();
  await prisma.fanTeamFollow.deleteMany();
  await prisma.fanBarFavorite.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.watchParty.deleteMany();
  await prisma.teamBarLink.deleteMany();
  await prisma.fan.deleteMany();
  await prisma.bar.deleteMany();
  await prisma.team.deleteMany();

  console.log("Seeding fans...");
  const fans = await Promise.all(
    Array.from({ length: 25 }).map((_, i) =>
      prisma.fan.create({
        data: {
          deviceId: `seed-device-${i + 1}`,
          displayName: i % 3 === 0 ? `Fan${i + 1}` : null,
        },
      })
    )
  );

  console.log("Seeding teams...");
  const teamRecords = new Map<string, string>();
  for (const t of teams) {
    const team = await prisma.team.create({ data: t });
    teamRecords.set(`${t.name}::${t.sport}`, team.id);
  }

  console.log("Seeding bars...");
  const barRecords = new Map<string, string>();
  for (const b of bars) {
    const { key, ...data } = b;
    const bar = await prisma.bar.create({ data: { ...data, city: CITY } });
    barRecords.set(key, bar.id);
  }

  console.log("Seeding team-bar links + verifications...");
  for (const [teamName, sport, barKey, count] of links) {
    const teamId = teamRecords.get(`${teamName}::${sport}`);
    const barId = barRecords.get(barKey);
    if (!teamId || !barId) {
      throw new Error(`Missing reference for ${teamName}/${sport}/${barKey}`);
    }

    await prisma.teamBarLink.create({
      data: { teamId, barId, verificationCount: count },
    });

    for (let i = 0; i < count; i++) {
      const fan = fans[Math.floor(Math.random() * fans.length)];
      const note = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
      await prisma.verification.create({
        data: {
          fanId: fan.id,
          teamId,
          barId,
          note,
          createdAt: randomPastDate(60),
        },
      });
    }
  }

  console.log("Seeding watch parties + RSVPs...");
  for (const wp of watchParties) {
    const teamId = teamRecords.get(`${wp.teamName}::${wp.sport}`);
    const barId = barRecords.get(wp.barKey);
    if (!teamId || !barId) {
      throw new Error(
        `Missing reference for watch party ${wp.teamName}/${wp.sport}/${wp.barKey}`
      );
    }

    const host = fans[wp.hostFanIndex];
    const party = await prisma.watchParty.create({
      data: {
        teamId,
        barId,
        city: CITY,
        dateTime: offsetDate(wp.daysOffset, wp.hour),
        note: wp.note,
        createdByFanId: host.id,
      },
    });

    const attendeeIndices = new Set([wp.hostFanIndex, ...wp.rsvpFanIndices]);
    for (const idx of attendeeIndices) {
      await prisma.rSVP.create({
        data: { fanId: fans[idx].id, watchPartyId: party.id },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
