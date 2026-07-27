import { prisma } from "@/lib/db";

const ADJECTIVES = [
  "billy",
  "rowdy",
  "salty",
  "lucky",
  "rusty",
  "silver",
  "golden",
  "mighty",
  "clever",
  "brave",
  "chill",
  "sneaky",
  "grumpy",
  "jolly",
  "spicy",
  "loud",
  "quiet",
  "wild",
  "cozy",
  "bold",
];

const NOUNS = [
  "goat",
  "falcon",
  "otter",
  "badger",
  "wolf",
  "hawk",
  "tiger",
  "panda",
  "fox",
  "bear",
  "eagle",
  "moose",
  "raven",
  "bison",
  "cobra",
  "lynx",
  "shark",
  "viper",
  "puma",
  "gator",
];

export function randomHandleCandidate(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 900) + 1;
  return `${adjective}${noun}${number}`;
}

const MAX_ATTEMPTS = 20;

export async function generateUniqueHandle(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = randomHandleCandidate();
    const existing = await prisma.fan.findUnique({ where: { handle: candidate } });
    if (!existing) return candidate;
  }
  // Astronomically unlikely fallback: timestamp suffix guarantees uniqueness.
  return `${randomHandleCandidate()}${Date.now().toString(36)}`;
}
