import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const result = ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    return result;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("user", args);
  },
});

export const updateUserProfile = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      firstName: args.firstName,
      lastName: args.lastName,
      name: `${args.firstName} ${args.lastName}`,
    };

    if (args.image) {
      updateData.image = args.image;
    }

    return await ctx.db.patch(user._id, updateData);
  },
});

export const updateUserImage = mutation({
  args: {
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      image: args.image,
    });
  },
});

export const setPrivatePin = mutation({
  args: {
    email: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      privatePin: args.pin,
    });
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});
