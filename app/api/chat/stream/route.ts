import { submitQuestion } from "@/lib/langgraph";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getConvexClient } from "@/lib/convex";
import {
  ChatRequestBody,
  StreamMessage,
  StreamMessageType,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
} from "@/lib/types";

export const runtime = "edge";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, newMessage, chatId } = (await req.json()) as ChatRequestBody;
    const convex = getConvexClient();

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });
        await convex.mutation(api.messages.send, { chatId, content: newMessage });

        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];

        const eventStream = await submitQuestion(langChainMessages, chatId);

        for await (const event of eventStream) {
          if (event.event === "on_chat_model_stream") {
            const token = event.data.chunk;
            if (token) {
              const text = token.content.at(0)?.["text"];
              if (text) {
                await sendSSEMessage(writer, {
                  type: StreamMessageType.Token,
                  token: text,
                });
              }
            }
          } else if (event.event === "on_tool_start") {
            await sendSSEMessage(writer, {
              type: StreamMessageType.ToolStart,
              tool: event.name || "unknown",
              input: event.data.input,
            });
          } else if (event.event === "on_tool_end") {
            await sendSSEMessage(writer, {
              type: StreamMessageType.ToolEnd,
              tool: event.name || "unknown",
              output: event.data.output,
            });
          }
        }

        await sendSSEMessage(writer, { type: StreamMessageType.Done });
      } catch (error) {
        console.error("Error in stream:", error);
        await sendSSEMessage(writer, {
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}