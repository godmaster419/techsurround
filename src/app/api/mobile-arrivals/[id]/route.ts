import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const arrival = await db.mobileArrival.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!arrival) {
      return NextResponse.json({ error: "Mobile arrival not found." }, { status: 404 });
    }
    return NextResponse.json({ arrival });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mobile arrival." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { galleryImages, ...data } = body;

    if (data.slug) {
      const existing = await db.mobileArrival.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
      }
    }

    // Update gallery images if provided
    if (galleryImages !== undefined) {
      await db.mobileImage.deleteMany({ where: { mobileArrivalId: id } });
      if (galleryImages.length > 0) {
        await db.mobileImage.createMany({
          data: galleryImages.map((img: { url: string; alt?: string }, i: number) => ({
            mobileArrivalId: id,
            url: img.url,
            alt: img.alt || "",
            order: i,
          })),
        });
      }
    }

    const arrival = await db.mobileArrival.update({
      where: { id },
      data,
      include: { images: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ arrival });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update mobile arrival." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await db.mobileArrival.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete mobile arrival." }, { status: 500 });
  }
}
