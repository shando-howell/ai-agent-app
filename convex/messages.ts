import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { chatId: v.id("chats")},
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("asc")
            .collect();

        return messages;
    },
});

export const send = mutation({
    args: {
        chatId: v.id("chats"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Save the user message with preserved newlines
        const messageId = await ctx.db.insert("messages", {
            chatId: args.chatId,
            content: args.content.replace(/\n/g, "\\n"),
            role: "user",
            createdAt: Date.now(),
        });

        return messageId;
    },
});

export const store = mutation({
    args: {
        chatId: v.id("chats"),
        content: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
    },
    handler: async (ctx, args) => {
        // Store message with preserved newlines and HTML
        const messageId = await ctx.db.insert("messages", {
            chatId: args.chatId,
            content: args.content
                .replace(/\n/g, "\\n")
                // Don't escape HTML - we'll trust the content since it's generated
                // by our system
                .replace(/\\/g, "\\\\"), // Only escape backslashes
            role: args.role,
            createdAt: Date.now(),
        });

        return messageId;
    },
});

export const getLastMessage = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const chat = await ctx.db.get(args.chatId);
        if (!chat || chat.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const lastMessage = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .order("desc")
            .first();

        return lastMessage;
    },
});