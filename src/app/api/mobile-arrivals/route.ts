import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET — List mobile arrivals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (brand) where.brand = brand;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    const [arrivals, total] = await Promise.all([
      db.mobileArrival.findMany({
        where: where as any,
        include: { images: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.mobileArrival.count({ where: where as any }),
    ]);

    return NextResponse.json({
      arrivals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/mobile-arrivals error:", error);
    return NextResponse.json({ error: "Failed to fetch mobile arrivals." }, { status: 500 });
  }
}

// POST — Create mobile arrival (admin)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const { galleryImages, ...data } = body;

    if (!data.brand || !data.name || !data.slug) {
      return NextResponse.json({ error: "Brand, name, and slug are required." }, { status: 400 });
    }

    const existing = await db.mobileArrival.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
    }

    const arrival = await db.mobileArrival.create({
      data: {
        ...data,
        images: galleryImages?.length
          ? {
              create: galleryImages.map((img: { url: string; alt?: string }, i: number) => ({
                url: img.url,
                alt: img.alt || "",
                order: i,
              })),
            }
          : undefined,
      },
      include: { images: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ arrival }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/mobile-arrivals error:", error);
    return NextResponse.json({ error: "Failed to create mobile arrival." }, { status: 500 });
  }
}
