import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

interface ChatPageProps {
    params: Promise<{
        chatId: Id<"chats">;
    }>;
}

async function ChatPage({params}: ChatPageProps) {
    const chatId = await params;

    // Get user authentication
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    // Get Convex client and fetch chat and messages
    const convex = getConvexClient();

    // Get messages
    const initalMessages = await convex.query(api.messages.list, {chatId});

    return (
        <div>ChatPage</div>
    )
}

export default ChatPage;