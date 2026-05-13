import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createFolder = mutation({
  args: {
    name: v.string(),
    teamId: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("folders", {
      ...args,
    });
  },
});

export const getFolders = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folders")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
  },
});

export const deleteFolder = mutation({
  args: {
    _id: v.id("folders"),
  },
  handler: async (ctx, args) => {
    // Before deleting, find all files in this folder and un-assign them
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("folderId"), args._id))
      .collect();

    for (const file of files) {
      await ctx.db.patch(file._id, { folderId: undefined });
    }

    return await ctx.db.delete(args._id);
  },
});

export const renameFolder = mutation({
  args: {
    _id: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, { name: args.name });
  },
});
