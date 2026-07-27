import type { NextRequest } from "next/server";
import { FEATURED_LISTS } from "@/lib/featuredLists";
import type { FeaturedListSummaryDTO } from "@/lib/types";

const PREVIEW_SIZE = 3;

// Preview (top 3) for every list, for the Featured Lists grid. Lists with
// no data for this city are omitted entirely rather than shown empty.
export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  if (!city) {
    return Response.json({ error: "city is required" }, { status: 400 });
  }

  const summaries = await Promise.all(
    FEATURED_LISTS.map(async (list): Promise<FeaturedListSummaryDTO | null> => {
      const items = await list.query(city, list.fullLimit);
      if (items.length === 0) return null;
      return {
        key: list.key,
        title: list.title,
        previewItems: items.slice(0, PREVIEW_SIZE),
        totalCount: items.length,
      };
    })
  );

  const dto = summaries.filter((s): s is FeaturedListSummaryDTO => s !== null);
  return Response.json(dto);
}
