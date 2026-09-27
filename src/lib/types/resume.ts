import { z } from "zod";
import { ProfileSchema } from "./profile";

export const ResumeItemOverridesSchema = z.object({
  title: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
  projectName: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).catchall(z.unknown());

export type ResumeItemOverrides = z.infer<typeof ResumeItemOverridesSchema>;

export const ResumeDraftItemSchema = z.object({
  vaultItemId: z.string(),
  visible: z.boolean().default(true),
  overrides: ResumeItemOverridesSchema.default({}),
});

export type ResumeDraftItem = z.infer<typeof ResumeDraftItemSchema>;

export const ResumeDraftSectionSchema = z.object({
  id: z.string(),
  type: z.string(), // semantic type e.g. "experience", "projects", "skills"
  displayName: z.string(), // user-customizable display name
  visible: z.boolean().default(true),
  items: z.array(ResumeDraftItemSchema).default([]),
});

export type ResumeDraftSection = z.infer<typeof ResumeDraftSectionSchema>;

export const ResumeDraftSchema = z.object({
  professionalTitle: z.string().default(""),
  sections: z.array(ResumeDraftSectionSchema).default([]),
});

export type ResumeDraft = z.infer<typeof ResumeDraftSchema>;

export const ResumeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Resume name is required"),
  templateId: z.string().default("classic"),
  templateVersion: z.number().int().default(1),
  draft: ResumeDraftSchema,
  archivedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Resume = z.infer<typeof ResumeSchema>;

export const CreateResumeSchema = z.object({
  name: z.string().min(1, "Resume name is required"),
  templateId: z.string().optional().default("classic"),
  templateVersion: z.number().int().optional().default(1),
  draft: ResumeDraftSchema.optional(),
});

export type CreateResumeInput = z.input<typeof CreateResumeSchema>;

export const ResolvedResumeItemSchema = z.object({
  vaultItemId: z.string(),
  category: z.string(),
  layout: z.string(),
  content: z.record(z.string(), z.unknown()),
  overrides: ResumeItemOverridesSchema,
  resolvedContent: z.record(z.string(), z.unknown()),
});

export type ResolvedResumeItem = z.infer<typeof ResolvedResumeItemSchema>;

export const ResolvedResumeSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  visible: z.boolean(),
  items: z.array(ResolvedResumeItemSchema),
});

export type ResolvedResumeSection = z.infer<typeof ResolvedResumeSectionSchema>;

export const ResumeSnapshotSchema = z.object({
  schemaVersion: z.number().int().default(1),
  templateId: z.string(),
  templateVersion: z.number().int(),
  profile: ProfileSchema,
  professionalTitle: z.string(),
  sections: z.array(ResolvedResumeSectionSchema),
});

export type ResumeSnapshot = z.infer<typeof ResumeSnapshotSchema>;

export const ResumeVersionSchema = z.object({
  id: z.string().uuid(),
  resumeId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  schemaVersion: z.number().int().default(1),
  templateId: z.string(),
  templateVersion: z.number().int().default(1),
  snapshot: ResumeSnapshotSchema,
  createdAt: z.string().datetime(),
});

export type ResumeVersion = z.infer<typeof ResumeVersionSchema>;
