import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamChat, generateTitle } from "@/lib/claude";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

interface ImageData {
  base64: string;
  type: string;
}

interface FileData {
  base64: string;
  type: string;
  name: string;
}

interface UploadedImage {
  url: string;
  type: string;
}

interface ProcessedFile {
  name: string;
  type: string;
  textContent: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { conversationId, message, images, files } = await request.json();

    if (!message && (!images || images.length === 0) && (!files || files.length === 0)) {
      return new Response(JSON.stringify({ error: "Message, images, or files required" }), {
        status: 400,
      });
    }

    // Process files and extract text content
    const processedFiles: ProcessedFile[] = [];
    if (files && files.length > 0) {
      for (const file of files as FileData[]) {
        const buffer = Buffer.from(file.base64, "base64");
        let textContent = "";

        if (file.type === "application/pdf") {
          try {
            // Dynamic import for pdf-parse to work with Turbopack
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfParseModule = await import("pdf-parse") as any;
            const pdfParse = pdfParseModule.default || pdfParseModule;
            const pdfData = await pdfParse(buffer);
            textContent = pdfData.text;
          } catch (error) {
            console.error("PDF parsing error:", error);
            textContent = "[PDFの読み取りに失敗しました]";
          }
        } else {
          // For text-based files, decode directly
          textContent = buffer.toString("utf-8");
        }

        processedFiles.push({
          name: file.name,
          type: file.type,
          textContent,
        });
      }
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
            include: { images: true, files: true },
          },
        },
      });
    }

    const isNewConversation = !conversation;
    if (!conversation) {
      const title = message
        ? message.slice(0, 30) + (message.length > 30 ? "..." : "")
        : processedFiles.length > 0
        ? processedFiles[0].name
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
    const storedContent = message || (uploadedImages.length > 0 || processedFiles.length > 0 ? "" : "");

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
        files: processedFiles.length > 0 ? {
          create: processedFiles.map((file) => ({
            name: file.name,
            type: file.type,
            textContent: file.textContent,
          })),
        } : undefined,
      },
      include: { images: true, files: true },
    });

    // Build message content with file contents for Claude
    let messageForClaude = message || "";
    if (processedFiles.length > 0) {
      const fileContents = processedFiles.map((file) =>
        `\n\n--- ファイル: ${file.name} ---\n${file.textContent}\n--- ファイル終了 ---`
      ).join("");
      messageForClaude = messageForClaude + fileContents;
    }

    const allMessages = [
      ...conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: messageForClaude },
    ];

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send conversation ID, uploaded image URLs, and file info
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
                files: userMessage.files?.map((file) => ({
                  id: file.id,
                  name: file.name,
                  type: file.type,
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
