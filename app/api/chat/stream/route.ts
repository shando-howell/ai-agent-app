import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody } from "@/lib/types";
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = (await req.json()) as ChatRequestBody
        const { messages, newMessage, chatId} = body;

        const convex = getConvexClient();

        // Create stream with larger queue strategy for better performance
        const stream = new TransformStream({}, { highWaterMark: 1024 });
        const writer = stream.writable.getWriter();

        const response = new Response(stream.readable, {
            headers: {
                "Content-Type": "text/event-stream",
                Connection: "keep-alive",
                'X-Accel-Buffering': "no", // Disable buffering for nginx which is required for SSE to work properly
            },
        });

        const startStream = async () => {
            try {
                // Stream will be implemented here
            } catch (error) {
                console.error('Error in chat API:', error);
                return NextResponse.json(
                    { error: "Failed to process chat request" } as const,
                    { status: 500 }
                );
            }
        };

        startStream();

        return response;
    } catch (error) {
        console.error("Error in chat API: ", error);
        return NextResponse.json(
            { error: "Failed to process chat request" } as const,
            { status: 500 }
        );
    }
}