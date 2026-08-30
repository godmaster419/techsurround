import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.status === "unsubscribed") {
        await db.newsletterSubscriber.update({
          where: { email },
          data: { status: "active" },
        });
        return NextResponse.json({ success: true, message: "Welcome back! You have been re-subscribed." });
      }
      return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    }

    await db.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ success: true, message: "Successfully subscribed!" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}

