'use client';

import { Id, Doc } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowBigRight } from "lucide-react";
import { ChatRequestBody } from "@/lib/types";
import { createSSEParser } from "@/lib/createSSEParser";

interface ChatInterfaceProps {
    chatId: Id<"chats">;
    initialMessages: Doc<"messages">[];
}

const ChatInterface = ({ chatId, initialMessages}: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState("");
    const [streamedResponse, setStreamedResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTool, setCurrentTool] = useState<{
        name: string;
        input: unknown;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const processStream = async () => {}

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamedResponse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        // Reset the US state for new message
        setInput("");
        setStreamedResponse("");
        setCurrentTool(null);
        setIsLoading(true);

        // Add user's message immediately for better UX
        const optimisticUserMessage: Doc<"messages"> = {
            _id: `temp_${Date.now()}`,
            chatId,
            content: trimmedInput,
            role: "user",
            createdAt: Date.now(),
        } as Doc<"messages">;

        setMessages((prev) => [...prev, optimisticUserMessage]);

        // Track complete response for saving to database
        let fullResponse = "";

        // Start streaming response
        try {
            const requestBody: ChatRequestBody = {
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                newMessage: trimmedInput,
                chatId,
            };

            // Initialize SSE connection
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(await response.text());
            if (!response.body) throw new Error("No response body available");

            // ----- Handle the stream -----
            // Create SSE parser and stream reader
            const parser = createSSEParser();
            const reader = response.body.getReader();
            // ------
        } catch (error) {
            // Handle any errors during streaming
            console.error("Error sending message: ", error);
            // Remove the optimistic user message if there was an error
            setMessages((prev) => 
                prev.filter((msg) => msg._id !== optimisticUserMessage._id)
            );
            setStreamedResponse(
                "error"
                // formatTerminalOutput(
                //     "error",
                //     "Failed to process message",
                //     error instanceof Error ? error.message : "unknown error"
                // )
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
            {/* Messages */}
            <section className="flex-1">
                <div>
                    {/* Messages */}
                    {messages.map((message) => (
                        <div key={message._id}>{message.content}</div>
                    ))}


                    {/* Last Messages */}
                    <div ref={messagesEndRef} />
                </div>
            </section>

            {/* Footer input */}
            <footer className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message AI Agent..."
                            className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2
                            focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center
                            transition-all ${input.trim()
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                : "bg-gray-100 text-gray-400"
                            }`}
                        >
                            <ArrowBigRight/>
                        </Button>
                    </div>
                </form>
            </footer>
        </main>
    )
}

export default ChatInterface;