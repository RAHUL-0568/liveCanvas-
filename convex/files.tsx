import { v } from "convex/values";
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      ...args,
      isPrivate: false,
      contributors: [args.createdBy],
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

export const getFiles = query({
  args: {
    teamId: v.string(),
    email: v.optional(v.string()),
    type: v.optional(v.string()), // 'team', 'shared', 'all'
  },
  handler: async (ctx, args) => {
    const type = args.type || "all";
    let files: any[] = [];

    if (type === "team" || type === "all") {
      const teamFiles = await ctx.db
        .query("files")
        .filter((q) => q.eq(q.field("teamId"), args.teamId))
        .collect();
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

    // Sort by creation time descending
    files.sort((a: any, b: any) => b._creationTime - a._creationTime);

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
      contributors: contributors
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
      contributors: contributors
    });
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
    return await ctx.db.patch(args._id, { fileName: args.fileName });
  },
});
