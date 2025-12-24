import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return Response.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const conversation = await prisma.conversation.create({
      data: {
        title: body.title || "新しい会話",
        userId: session.user.id,
      },
      include: { messages: true },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return Response.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
