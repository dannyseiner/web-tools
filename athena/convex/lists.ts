import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  baseSlug: string,
  excludeListId?: Id<"lists">,
): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await ctx.db
      .query("lists")
      .withIndex("by_projectId_and_slug", (q) =>
        q.eq("projectId", projectId).eq("slug", slug),
      )
      .first();

    if (!existing || existing._id === excludeListId) {
      return slug;
    }

    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }
}

const fieldValidator = v.object({
  name: v.string(),
  label: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("boolean"),
    v.literal("date"),
    v.literal("select"),
    v.literal("url"),
    v.literal("richtext"),
  ),
  required: v.boolean(),
  options: v.optional(v.array(v.string())),
  defaultValue: v.optional(v.string()),
});

async function assertProjectMember(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  projectId: Id<"projects">,
  requireManager = false,
) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_organizationId_and_userId", (q) =>
      q.eq("organizationId", project.organizationId).eq("userId", userId),
    )
    .first();

  if (!membership) {
    throw new Error("You must be a member of this organization");
  }

  if (requireManager && membership.role === "Member") {
    throw new Error("Only Admins and Managers can perform this action");
  }

  return { project, membership };
}

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    fields: v.array(fieldValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    await assertProjectMember(ctx, userId, args.projectId);

    if (!args.name || args.name.trim().length === 0) {
      throw new Error("List name is required");
    }

    const slug = await ensureUniqueSlug(
      ctx,
      args.projectId,
      generateSlug(args.name.trim()),
    );

    const listId = await ctx.db.insert("lists", {
      projectId: args.projectId,
      name: args.name.trim(),
      slug,
      description: args.description,
      icon: args.icon,
      fields: args.fields,
      createdBy: userId,
    });

    return listId;
  },
});

export const update = mutation({
  args: {
    listId: v.id("lists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    fields: v.optional(v.array(fieldValidator)),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    await assertProjectMember(ctx, userId, list.projectId);

    if (args.name !== undefined && args.name.trim().length === 0) {
      throw new Error("List name cannot be empty");
    }

    let slugUpdate: { slug: string } | undefined;
    if (args.name !== undefined) {
      const slug = await ensureUniqueSlug(
        ctx,
        list.projectId,
        generateSlug(args.name.trim()),
        args.listId,
      );
      slugUpdate = { slug };
    }

    await ctx.db.patch(args.listId, {
      ...(args.name !== undefined && { name: args.name.trim() }),
      ...slugUpdate,
      ...(args.description !== undefined && {
        description: args.description,
      }),
      ...(args.icon !== undefined && { icon: args.icon }),
      ...(args.fields !== undefined && { fields: args.fields }),
    });
  },
});

export const remove = mutation({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    await assertProjectMember(ctx, userId, list.projectId, true);

    const items = await ctx.db
      .query("listItems")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.listId);
  },
});

export const get = query({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const list = await ctx.db.get(args.listId);
    if (!list) return null;

    const project = await ctx.db.get(list.projectId);
    if (!project) return null;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) return null;

    return list;
  },
});

export const getByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) return [];

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return lists;
  },
});

export const getByProjectPublic = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return lists.map((list) => ({
      _id: list._id,
      name: list.name,
      slug: list.slug,
      description: list.description,
      icon: list.icon,
      fields: list.fields,
      _creationTime: list._creationTime,
    }));
  },
});

export const getBySlug = query({
  args: {
    projectId: v.id("projects"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("lists")
      .withIndex("by_projectId_and_slug", (q) =>
        q.eq("projectId", args.projectId).eq("slug", args.slug),
      )
      .first();

    if (!list) return null;

    const items = await ctx.db
      .query("listItems")
      .withIndex("by_listId_and_order", (q) => q.eq("listId", list._id))
      .collect();

    return { ...list, items };
  },
});

export const createItem = mutation({
  args: {
    listId: v.id("lists"),
    values: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const list = await ctx.db.get(args.listId);
    if (!list) {
      throw new Error("List not found");
    }

    await assertProjectMember(ctx, userId, list.projectId);

    const lastItem = await ctx.db
      .query("listItems")
      .withIndex("by_listId_and_order", (q) => q.eq("listId", args.listId))
      .order("desc")
      .first();

    const order = lastItem ? lastItem.order + 1 : 0;

    const itemId = await ctx.db.insert("listItems", {
      listId: args.listId,
      projectId: list.projectId,
      values: args.values,
      order,
      createdBy: userId,
    });

    return itemId;
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("listItems"),
    values: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await assertProjectMember(ctx, userId, item.projectId);

    await ctx.db.patch(args.itemId, {
      values: args.values,
    });
  },
});

export const removeItem = mutation({
  args: {
    itemId: v.id("listItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await assertProjectMember(ctx, userId, item.projectId);

    await ctx.db.delete(args.itemId);
  },
});

export const getItems = query({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const list = await ctx.db.get(args.listId);
    if (!list) return [];

    const project = await ctx.db.get(list.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) return [];

    const items = await ctx.db
      .query("listItems")
      .withIndex("by_listId_and_order", (q) => q.eq("listId", args.listId))
      .collect();

    return items;
  },
});

export const reorderItems = mutation({
  args: {
    items: v.array(
      v.object({
        itemId: v.id("listItems"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    if (args.items.length === 0) return;

    const firstItem = await ctx.db.get(args.items[0].itemId);
    if (!firstItem) {
      throw new Error("Item not found");
    }

    await assertProjectMember(ctx, userId, firstItem.projectId);

    for (const { itemId, order } of args.items) {
      await ctx.db.patch(itemId, { order });
    }
  },
});
