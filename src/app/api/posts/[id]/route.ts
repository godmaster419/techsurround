import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/config";

// GET — Single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch post." }, { status: 500 });
  }
}

// PUT — Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const {
      title, slug, excerpt, content, featuredImage,
      authorId, categoryId, status: postStatus, publishedAt, scheduledAt,
      isFeatured, isTrending, seoTitle, seoDescription,
      focusKeyword, canonicalUrl, ogImage, tagIds,
    } = body;

    // Check slug uniqueness (excluding current post)
    if (slug) {
      const existing = await db.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
      }
    }

    const readingTime = content ? calculateReadingTime(content) : undefined;

    // Update tags if provided
    if (tagIds !== undefined) {
      await db.postTag.deleteMany({ where: { postId: id } });
      if (tagIds.length > 0) {
        await db.postTag.createMany({
          data: tagIds.map((tagId: string) => ({ postId: id, tagId })),
        });
      }
    }

    const post = await db.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(authorId !== undefined && { authorId: authorId || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(postStatus !== undefined && { status: postStatus }),
        ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(readingTime !== undefined && { readingTime }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isTrending !== undefined && { isTrending }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogImage !== undefined && { ogImage }),
      },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

// DELETE — Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await db.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
