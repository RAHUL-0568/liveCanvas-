import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFiles = query({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("excalidrawFiles")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .collect();
  },
});

export const addFile = mutation({
  args: {
    fileId: v.string(), // The ID of the drawing file
    excalidrawFileId: v.string(), // The ID inside the drawing
    dataURL: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("excalidrawFiles")
      .filter((q) => 
        q.and(
          q.eq(q.field("fileId"), args.fileId),
          q.eq(q.field("excalidrawFileId"), args.excalidrawFileId)
        )
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("excalidrawFiles", {
      fileId: args.fileId,
      excalidrawFileId: args.excalidrawFileId,
      dataURL: args.dataURL,
      mimeType: args.mimeType,
      created: Date.now(),
    });
  },
});
