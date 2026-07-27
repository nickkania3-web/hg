import type { NextRequest } from "next/server";
import { FEATURED_LISTS } from "@/lib/featuredLists";
import type { FeaturedListDetailDTO } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const city = request.nextUrl.searchParams.get("city");

  if (!city) {
    return Response.json({ error: "city is required" }, { status: 400 });
  }

  const list = FEATURED_LISTS.find((l) => l.key === key);
  if (!list) {
    return Response.json({ error: "unknown list" }, { status: 404 });
  }

  const items = await list.query(city, list.fullLimit);

  const dto: FeaturedListDetailDTO = {
    key: list.key,
    title: list.title,
    items,
  };

  return Response.json(dto);
}
