import { useRouter } from "next/navigation"
import { use } from "react";
import { Button } from "./ui/button";
import { NavigationContext } from "@/lib/NavigationProvider";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ChatRow from "./ChatsRow";

const SideBar = () => {
    const router = useRouter();
    const { closeMobileNav, isMobileNavOpen } = use(NavigationContext);

    const chats = useQuery(api.chats.listChats);
    const createChat = useMutation(api.chats.createChat);
    const deleteChat = useMutation(api.chats.deleteChat);

    const handleNewChat = async () => {
        const chatId = await createChat({ title: "New Chat" });
        router.push(`/dashboard/chat/${chatId}`);
        closeMobileNav();
    };

    const handleDeleteChat = async (id: Id<"chats">) => {
        await deleteChat({ id });
        // If we're currently viewing this chat, redirect to dashboard
        if (window.location.pathname.includes(id)) {
            router.push("/dashboard");
        }
    };

    return (
        <>
            {/* Background overlay for mobile */}
            {isMobileNavOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={closeMobileNav}
                />
            )}

            <div className={cn(
                "fixed md:inset-y-0 top-14 bottom-0 left-0 z-50 w-72 bg-gray-50/50 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col",
                isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            )}
            >
                <div className="p-4 border-b border-gray-200/50">
                    <Button
                        onClick={handleNewChat}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/50 shadow-sm hover:shadow transition-all duration-200"
                    >
                        New Chat
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {chats?.map((chat) => (
                        <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default SideBar