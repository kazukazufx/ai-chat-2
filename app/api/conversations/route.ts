import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
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
    const body = await request.json();

    const conversation = await prisma.conversation.create({
      data: {
        title: body.title || "新しい会話",
      },
      include: { messages: true },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return Response.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
