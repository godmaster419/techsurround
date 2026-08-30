import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const authors = await db.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json({ authors });
  } catch (error) {
    console.error("GET /api/authors error:", error);
    return NextResponse.json({ error: "Failed to fetch authors." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, slug, bio, image, twitter, linkedin, website } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    }

    const author = await db.author.create({
      data: { name, slug, bio, image, twitter, linkedin, website },
    });

    return NextResponse.json({ author }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/authors error:", error);
    return NextResponse.json({ error: "Failed to create author." }, { status: 500 });
  }
}
