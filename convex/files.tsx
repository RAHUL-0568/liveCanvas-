import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createNewFile = mutation({
  args: {
    fileName: v.string(),
    teamId: v.string(),
    createdBy: v.string(),
    archieved: v.boolean(),
    document: v.string(),
    whiteboard: v.string(),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    // Check for duplicate name in the same folder
    const existingFile = await ctx.db
      .query("files")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("folderId"), args.folderId),
          q.eq(q.field("fileName"), args.fileName)
        )
      )
      .first();

    if (existingFile) {
      throw new ConvexError(`A file named "${args.fileName}" already exists here.`);
    }

    return await ctx.db.insert("files", {
      ...args,
      isPrivate: false,
      contributors: [args.createdBy],
      lastAccessed: Date.now(),
    });
  },
});

export const toggleFilePrivacy = mutation({
  args: {
    _id: v.id("files"),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, { isPrivate: args.isPrivate });
  },
});

export const moveFileToFolder = mutation({
  args: {
    _id: v.id("files"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const fileToMove = await ctx.db.get(args._id);
    if (!fileToMove) {
      throw new ConvexError("File not found");
    }

    // Check if a file with the same name already exists in the destination folder
    const existingFile = await ctx.db
      .query("files")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamId"), fileToMove.teamId),
          q.eq(q.field("folderId"), args.folderId),
          q.eq(q.field("fileName"), fileToMove.fileName)
        )
      )
      .first();

    if (existingFile && existingFile._id !== args._id) {
      throw new ConvexError(`A file named "${fileToMove.fileName}" already exists in the destination.`);
    }

    return await ctx.db.patch(args._id, { folderId: args.folderId });
  },
});

export const getFiles = query({
  args: {
    teamId: v.string(),
    email: v.optional(v.string()),
    type: v.optional(v.string()), // 'team', 'shared', 'all'
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const type = args.type || "all";
    let files: any[] = [];

    if (type === "team" || type === "all") {
      let query = ctx.db
        .query("files")
        .filter((q) => q.eq(q.field("teamId"), args.teamId));
      
      if (args.folderId) {
        query = query.filter((q) => q.eq(q.field("folderId"), args.folderId));
      } else if (type === "team") {
        // Only show root files if specifically looking at team files without a folder
        query = query.filter((q) => q.eq(q.field("folderId"), undefined));
      }

      const teamFiles = await query.collect();
      files = [...files, ...teamFiles];
    }

    if ((type === "shared" || type === "all") && args.email) {
      const allFiles = await ctx.db.query("files").collect();
      const sharedFiles = allFiles.filter((file: any) => 
        file.contributors?.includes(args.email!) && 
        file.teamId !== args.teamId &&
        !file.isPrivate
      );
      files = [...files, ...sharedFiles];
    }

    // De-duplicate if needed (though unlikely with these filters)
    const uniqueFiles = Array.from(new Map(files.map(f => [f._id, f])).values());
    files = uniqueFiles;

    // Sort by last accessed time descending (Fall back to creation time for older files)
    files.sort((a: any, b: any) => (b.lastAccessed || b._creationTime) - (a.lastAccessed || a._creationTime));

    return Promise.all(
      files.map(async (file) => {
        const team = await ctx.db.get(file.teamId as Id<"teams">);
        const teamName = team?.teamName || "Personal";

        const contributorEmails = file.contributors || [file.createdBy];
        const contributors = await Promise.all(
          contributorEmails.map(async (email: string) => {
            const user = await ctx.db
              .query("user")
              .filter((q) => q.eq(q.field("email"), email))
              .first();
            return {
              email,
              name: user?.name || email.split("@")[0] || "User",
              image: user?.image || "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais",
            };
          })
        );
          
        return {
          ...file,
          teamName,
          contributors,
        };
      })
    );
  },
});

export const updateDocument = mutation({
  args: {
    _id: v.id("files"),
    document: v.string(),
    contributor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args._id);
    if (!file) return;

    let contributors = file.contributors || [file.createdBy];
    if (args.contributor && !contributors.includes(args.contributor)) {
      contributors.push(args.contributor);
    }

    return await ctx.db.patch(args._id, { 
      document: args.document,
      contributors: contributors,
      lastAccessed: Date.now(),
    });
  },
});

export const updateWhiteboard = mutation({
  args: {
    _id: v.id("files"),
    whiteboard: v.string(),
    contributor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args._id);
    if (!file) return;

    let contributors = file.contributors || [file.createdBy];
    if (args.contributor && !contributors.includes(args.contributor)) {
      contributors.push(args.contributor);
    }

    return await ctx.db.patch(args._id, { 
      whiteboard: args.whiteboard,
      contributors: contributors,
      lastAccessed: Date.now(),
    });
  },
});

export const updateLastAccessed = mutation({
  args: { _id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args._id);
    if (!file) return;

    const now = Date.now();
    const lastUpdate = file.lastAccessed || 0;
    
    // Only update if it's been more than 5 minutes since the last update
    // This prevents infinite loops and redundant writes while still keeping "Recent" data fresh enough
    if (now - lastUpdate > 5 * 60 * 1000) {
       await ctx.db.patch(args._id, { lastAccessed: now });
    }
  },
});

export const getFilebyId = query({
  args: {
    _id: v.string(),
  },
  handler: async (ctx, args) => {
    // Attempt to normalize to a valid file ID
    let fileId;
    try {
      fileId = ctx.db.normalizeId("files", args._id);
    } catch (e) {
      return null;
    }

    if (!fileId) return null;

    const file = await ctx.db.get(fileId);
    if (!file) return null;

    const contributorEmails = file.contributors || [file.createdBy];
    const contributors = await Promise.all(
      contributorEmails.map(async (email: string) => {
        const user = await ctx.db
          .query("user")
          .filter((q) => q.eq(q.field("email"), email))
          .first();
        return {
          email,
          name: user?.name || email.split("@")[0] || "User",
          image: user?.image || "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais",
        };
      })
    );

    return {
      ...file,
      contributors,
    };
  },
});

export const deleteFile = mutation({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});

export const archiveFile = mutation({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, { archieved: true });
  },
});

export const unarchiveFile = mutation({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, { archieved: false });
  },
});

export const addContributor = mutation({
  args: {
    _id: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    let fileId;
    try {
      fileId = ctx.db.normalizeId("files", args._id);
    } catch (e) {
      return;
    }
    if (!fileId) return;

    const file = await ctx.db.get(fileId);
    if (!file) return;

    let contributors = file.contributors || [file.createdBy];
    if (!contributors.includes(args.email)) {
      contributors.push(args.email);
      await ctx.db.patch(fileId, { contributors });
    }
  },
});

export const updateFileName = mutation({
  args: {
    _id: v.id("files"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args._id);
    if (!file) throw new ConvexError("File not found");

    // Check if another file with the same name exists in the same folder
    const existingFile = await ctx.db
      .query("files")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamId"), file.teamId),
          q.eq(q.field("folderId"), file.folderId),
          q.eq(q.field("fileName"), args.fileName)
        )
      )
      .first();

    if (existingFile && existingFile._id !== args._id) {
      throw new ConvexError(`A file named "${args.fileName}" already exists in this folder.`);
    }

    return await ctx.db.patch(args._id, { fileName: args.fileName });
  },
});
