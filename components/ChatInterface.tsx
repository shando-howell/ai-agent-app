'use client';

import { Id, Doc } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowBigRight } from "lucide-react";

interface ChatInterfaceProps {
    chatId: Id<"chats">;
    initialMessages: Doc<"messages">[];
}

const ChatInterface = ({ chatId, initialMessages}: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <main>
            {/* Messages */}
            <section>

            </section>

            {/* Footer input */}
            <footer className="border-t bg-white p-4">
                <form>
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