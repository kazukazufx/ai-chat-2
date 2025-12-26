import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamChat, generateTitle } from "@/lib/claude";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

interface ImageData {
  base64: string;
  type: string;
}

interface UploadedImage {
  url: string;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { conversationId, message, images } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return new Response(JSON.stringify({ error: "Message or images required" }), {
        status: 400,
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: { images: true },
          },
        },
      });
    }

    const isNewConversation = !conversation;
    if (!conversation) {
      const title = message
        ? message.slice(0, 30) + (message.length > 30 ? "..." : "")
        : "画像を送信";
      conversation = await prisma.conversation.create({
        data: {
          title,
          userId: session.user.id,
        },
        include: { messages: true },
      });
    }

    // Upload images to Vercel Blob
    const uploadedImages: UploadedImage[] = [];
    if (images && images.length > 0) {
      for (const img of images as ImageData[]) {
        const buffer = Buffer.from(img.base64, "base64");
        const extension = img.type.split("/")[1] || "png";
        const filename = `chat-images/${conversation.id}/${Date.now()}.${extension}`;

        const blob = await put(filename, buffer, {
          access: "public",
          contentType: img.type,
        });

        uploadedImages.push({
          url: blob.url,
          type: img.type,
        });
      }
    }

    // Store message content
    const storedContent = message || (uploadedImages.length > 0 ? "" : "");

    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content: storedContent,
        conversationId: conversation.id,
        images: uploadedImages.length > 0 ? {
          create: uploadedImages.map((img) => ({
            url: img.url,
            type: img.type,
          })),
        } : undefined,
      },
      include: { images: true },
    });

    const allMessages = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message || "" },
    ];

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send conversation ID and uploaded image URLs
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                conversationId: conversation.id,
                userMessageId: userMessage.id,
                images: userMessage.images?.map((img) => ({
                  id: img.id,
                  url: img.url,
                  type: img.type,
                })),
              })}\n\n`
            )
          );

          for await (const chunk of streamChat(allMessages, images)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          await prisma.message.create({
            data: {
              role: "assistant",
              content: fullResponse,
              conversationId: conversation.id,
            },
          });

          // Generate title for new conversations
          if (isNewConversation && message) {
            const generatedTitle = await generateTitle(message, fullResponse);
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { title: generatedTitle },
            });
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ title: generatedTitle })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
