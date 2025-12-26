import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

interface ImageContent {
  type: "image";
  source: {
    type: "base64";
    media_type: ImageMediaType;
    data: string;
  };
}

interface TextContent {
  type: "text";
  text: string;
}

type ContentBlock = TextContent | ImageContent;

interface MessageParam {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface ImageData {
  base64: string;
  type: string;
}

export async function generateTitle(
  userMessage: string,
  assistantMessage: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: `以下の会話の内容を表す簡潔なタイトルを日本語で生成してください。タイトルのみを出力し、説明は不要です。15文字以内にしてください。

ユーザー: ${userMessage.slice(0, 200)}
アシスタント: ${assistantMessage.slice(0, 200)}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (textBlock && textBlock.type === "text") {
      return textBlock.text.trim().slice(0, 30);
    }
    return userMessage.slice(0, 30);
  } catch (error) {
    console.error("Failed to generate title:", error);
    return userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : "");
  }
}

export async function* streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  images?: ImageData[]
) {
  // Build the messages array for the API
  const apiMessages: MessageParam[] = messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Handle the last message with potential images
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    if (images && images.length > 0) {
      const content: ContentBlock[] = [];

      // Add images first
      for (const img of images) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.type as ImageMediaType,
            data: img.base64,
          },
        });
      }

      // Add text if present
      if (lastMessage.content) {
        content.push({
          type: "text",
          text: lastMessage.content,
        });
      }

      apiMessages.push({
        role: lastMessage.role,
        content,
      });
    } else {
      apiMessages.push({
        role: lastMessage.role,
        content: lastMessage.content,
      });
    }
  }

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: apiMessages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
