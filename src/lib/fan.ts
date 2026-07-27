import { prisma } from "@/lib/db";
import { generateUniqueHandle } from "@/lib/handle";

export async function getOrCreateFan(deviceId: string, displayName?: string) {
  const existing = await prisma.fan.findUnique({ where: { deviceId } });

  if (existing) {
    if (displayName && displayName !== existing.displayName) {
      return prisma.fan.update({
        where: { id: existing.id },
        data: { displayName },
      });
    }
    return existing;
  }

  const handle = await generateUniqueHandle();
  return prisma.fan.create({
    data: { deviceId, displayName: displayName ?? null, handle },
  });
}
