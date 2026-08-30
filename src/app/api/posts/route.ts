import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/config";

// GET — List posts (public: published only, admin: all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const author = searchParams.get("author");
    const search = searchParams.get("search");
    const admin = searchParams.get("admin") === "true";

    const where: Record<string, unknown> = {};

    if (admin) {
      try { await requireAuth(); } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (status) where.status = status;
    } else {
      where.status = "published";
      where.publishedAt = { lte: new Date() };
    }

    if (category) where.category = { slug: category };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (featured === "true") where.isFeatured = true;
    if (trending === "true") where.isTrending = true;
    if (author) where.author = { slug: author };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: where as any,
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true, slug: true, image: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where: where as any }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

// POST — Create post (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const {
      title, slug, excerpt, content, featuredImage,
      authorId, categoryId, status: postStatus, publishedAt, scheduledAt,
      isFeatured, isTrending, seoTitle, seoDescription,
      focusKeyword, canonicalUrl, ogImage, tagIds,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
    }

    const readingTime = content ? calculateReadingTime(content) : 1;

    const post = await db.post.create({
      data: {
        title, slug, excerpt, content, featuredImage,
        authorId: authorId || null,
        categoryId: categoryId || null,
        status: postStatus || "draft",
        publishedAt: publishedAt ? new Date(publishedAt) : postStatus === "published" ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        readingTime,
        isFeatured: isFeatured || false,
        isTrending: isTrending || false,
        seoTitle, seoDescription, focusKeyword, canonicalUrl, ogImage,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
