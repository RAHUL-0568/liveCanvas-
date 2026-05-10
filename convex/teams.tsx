import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getTeams = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("createdBy"), args.email))
      .collect();
  },
});

export const createTeam = mutation({
  args: {
    teamName: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existingTeam = await ctx.db
      .query("teams")
      .filter((q) =>
        q.and(
          q.eq(q.field("teamName"), args.teamName),
          q.eq(q.field("createdBy"), args.createdBy)
        )
      )
      .unique();

    if (existingTeam) {
      return { error: "Same name team already exist" };
    }

    return await ctx.db.insert("teams", args);
  },
});

export const deleteTeam = mutation({
  args: {
    _id: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});

export const deleteTeamAndCleanup = mutation({
  args: {
    teamId: v.id("teams"),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify ownership and delete the team
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }
    
    if (team.createdBy !== args.userEmail) {
      throw new Error("Only the team creator can delete the workspace");
    }

    await ctx.db.delete(args.teamId);

    // 2. Delete all files created by this user
    // We query for files created by this user across ALL teams
    const userCreatedFiles = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("createdBy"), args.userEmail))
      .collect();

    for (const file of userCreatedFiles) {
      await ctx.db.delete(file._id);
    }

    // 3. Optional: Remove user from shared files
    // To avoid hitting execution limits, we only do this for files in the deleted team
    // or just leave it for now if it's too expensive. 
    // Given the request, we'll try to find files where they are contributors.
    const allFiles = await ctx.db.query("files").collect();
    const batchSize = 100; // Convex has limits on mutations per call
    let count = 0;

    for (const file of allFiles) {
      if (file.contributors?.includes(args.userEmail) && file.createdBy !== args.userEmail) {
        const newContributors = file.contributors.filter((email: string) => email !== args.userEmail);
        await ctx.db.patch(file._id, { contributors: newContributors });
        count++;
        if (count >= batchSize) break; // Limit mutations to avoid timeouts
      }
    }
    
    return { success: true, deletedFiles: userCreatedFiles.length };
  },
});
