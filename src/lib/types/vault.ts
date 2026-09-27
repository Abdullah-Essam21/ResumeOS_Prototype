import { z } from "zod";

export const VaultCategorySchema = z.enum([
  "experience",
  "education",
  "project",
  "certification",
  "achievement",
  "skill",
  "custom",
]);

export type VaultCategory = z.infer<typeof VaultCategorySchema>;

export const VaultLayoutSchema = z.enum(["timeline", "record", "tags"]);

export type VaultLayout = z.infer<typeof VaultLayoutSchema>;

export const TimelineContentSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  title: z.string().min(1, "Title / Role is required"),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  location: z.string().optional().default(""),
  bullets: z.array(z.string()).default([]),
});

export type TimelineContent = z.infer<typeof TimelineContentSchema>;

export const RecordContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issuer: z.string().optional().default(""),
  date: z.string().optional().default(""),
  link: z.string().url().optional().or(z.literal("")),
  description: z.string().optional().default(""),
});

export type RecordContent = z.infer<typeof RecordContentSchema>;

export const TagsContentSchema = z.object({
  category: z.string().min(1, "Category name is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

export type TagsContent = z.infer<typeof TagsContentSchema>;

export const VaultContentSchema = z.discriminatedUnion("layout", [
  z.object({
    layout: z.literal("timeline"),
    data: TimelineContentSchema,
  }),
  z.object({
    layout: z.literal("record"),
    data: RecordContentSchema,
  }),
  z.object({
    layout: z.literal("tags"),
    data: TagsContentSchema,
  }),
]);

export type VaultContent = z.infer<typeof VaultContentSchema>;

export const VaultItemSchema = z.object({
  id: z.string().uuid(),
  category: VaultCategorySchema,
  layout: VaultLayoutSchema,
  displayOrder: z.number().int().default(0),
  content: z.union([TimelineContentSchema, RecordContentSchema, TagsContentSchema]),
  archivedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type VaultItem = z.infer<typeof VaultItemSchema>;

export const CreateVaultItemSchema = z.object({
  category: VaultCategorySchema,
  layout: VaultLayoutSchema,
  displayOrder: z.number().int().optional().default(0),
  content: z.union([TimelineContentSchema, RecordContentSchema, TagsContentSchema]),
});

export type CreateVaultItemInput = z.input<typeof CreateVaultItemSchema>;

export const UpdateVaultItemSchema = z.object({
  category: VaultCategorySchema.optional(),
  layout: VaultLayoutSchema.optional(),
  displayOrder: z.number().int().optional(),
  content: z
    .union([
      TimelineContentSchema.partial(),
      RecordContentSchema.partial(),
      TagsContentSchema.partial(),
    ])
    .optional(),
});

export type UpdateVaultItemInput = z.input<typeof UpdateVaultItemSchema>;

