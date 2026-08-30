import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], query: q || "" });
    }

    const [posts, mobileArrivals, trendingApps] = await Promise.all([
      db.post.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        select: {
          title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true,
          category: { select: { name: true, slug: true } },
        },
        take: 10,
        orderBy: { publishedAt: "desc" },
      }),
      db.mobileArrival.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { brand: { contains: q } },
          ],
        },
        select: {
          name: true, slug: true, brand: true, primaryImage: true, price: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      db.trendingApp.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { developer: { contains: q } },
          ],
        },
        select: {
          name: true, slug: true, icon: true, developer: true, platform: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      query: q,
      results: {
        posts: posts.map((p) => ({
          ...p,
          type: "article" as const,
          url: `/${p.category?.slug}/${p.slug}`,
        })),
        mobileArrivals: mobileArrivals.map((m) => ({
          ...m,
          type: "mobile" as const,
          url: `/new-mobile-arrivals/${m.slug}`,
        })),
        trendingApps: trendingApps.map((a) => ({
          ...a,
          type: "app" as const,
          url: `/trending-apps/${a.slug}`,
        })),
      },
      totalResults: posts.length + mobileArrivals.length + trendingApps.length,
    });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
