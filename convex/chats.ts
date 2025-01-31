import { mutation } from "./_generated/server";
import { v } from "convex/values";


// createChat("Hello123")
export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error("not authenticated");
    }

    const chat = await ctx.db.insert("chats", {
      title: args.title,
      userId: identify.subject,
      createdAt: Date.now(),
    });
    return chat;
  },
});
