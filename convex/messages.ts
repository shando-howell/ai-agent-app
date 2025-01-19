import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SHOW_COMMENTS = true;

export const list = query({
    args: { chatId: v.id("chats")},
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("asc")
            .collect();

        if (SHOW_COMMENTS) {
            console.log("Retrieved messages: ", {
                chatId: args.chatId,
                count: messages.length,
            });
        }

        return messages;
    },
});

export const sent = mutation({
    args: {
        chatId: v.id("chats"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Save the user message with preserved newlines
        // const messageId = await ctx.db.insert("messages", {
        //     chatId: args.chatId
        // })

    }
})