import { z } from "zod";

// Ring types (inner to outer)
export const RingSchema = z.enum(["Adopt", "Trial", "Assess", "Hold"]);
export type Ring = z.infer<typeof RingSchema>;

// Status types for movement tracking
export const StatusSchema = z.enum([
  "New",
  "Moved In",
  "Moved Out",
  "No Change",
]);
export type Status = z.infer<typeof StatusSchema>;

// Quadrant types
export const QuadrantSchema = z.enum([
  "Techniques",
  "Platforms",
  "Tools",
  "Languages & Frameworks",
]);
export type Quadrant = z.infer<typeof QuadrantSchema>;

// Link schema for external resources
export const LinkSchema = z.object({
  title: z.string().min(1, "Link title is required"),
  url: z.string().url("Must be a valid URL"),
});
export type Link = z.infer<typeof LinkSchema>;

// History entry schema for tracking ring transitions
export const HistoryEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  ring: RingSchema,
  note: z.string().min(1, "History note is required"),
  pr: z.string().regex(/^#\d+$/, "PR must be in format #123").optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// Blip front-matter schema (full)
export const BlipFrontMatterSchema = z.object({
  // Required fields
  name: z.string().min(1, "Blip name is required"),
  quadrant: QuadrantSchema,
  ring: RingSchema,
  status: StatusSchema,

  // Optional but recommended
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  owners: z.array(z.string()).default([]),
  since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Since date must be in YYYY-MM-DD format")
    .optional(),
  last_reviewed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Last reviewed date must be in YYYY-MM-DD format")
    .optional(),
  links: z.array(LinkSchema).default([]),

  // History tracking
  history: z.array(HistoryEntrySchema).default([]),
});
export type BlipFrontMatter = z.infer<typeof BlipFrontMatterSchema>;

// Blip with content (after parsing markdown)
export const BlipWithContentSchema = BlipFrontMatterSchema.extend({
  content: z.string(),
  filePath: z.string(),
  slug: z.string(),
});
export type BlipWithContent = z.infer<typeof BlipWithContentSchema>;

// Radar configuration schema
export const RadarConfigSchema = z.object({
  title: z.string().min(1, "Radar title is required"),
  repo_url: z.string().url("Repository URL must be valid"),
  base_path: z.string().default("/"),
  quadrants: z.array(z.string()).length(4, "Must have exactly 4 quadrants"),
  rings: z.array(z.string()).length(4, "Must have exactly 4 rings"),
  colors: z.record(z.string(), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be hex color")),
  description: z.string().optional(),
  org_name: z.string().optional(),
  show_recent_changes_days: z.number().int().positive().default(90),
  changelog_days: z.number().int().positive().default(90),
});
export type RadarConfig = z.infer<typeof RadarConfigSchema>;

// Zalando radar.js entry format
// Reference: https://github.com/zalando/tech-radar
export const ZalandoEntrySchema = z.object({
  label: z.string(),
  quadrant: z.number().int().min(0).max(3), // 0=bottom-right, clockwise
  ring: z.number().int().min(0).max(3), // 0=inner (Adopt) to 3=outer (Hold)
  moved: z.number().int().min(-1).max(2), // -1=out, 0=no change, 1=in, 2=new
});
export type ZalandoEntry = z.infer<typeof ZalandoEntrySchema>;

// Zalando radar data structure
export const ZalandoRadarDataSchema = z.object({
  entries: z.array(ZalandoEntrySchema),
  config: RadarConfigSchema,
});
export type ZalandoRadarData = z.infer<typeof ZalandoRadarDataSchema>;

// Change log entry for recent transitions
export const ChangeLogEntrySchema = z.object({
  blipName: z.string(),
  quadrant: QuadrantSchema,
  date: z.string(),
  fromRing: RingSchema.optional(),
  toRing: RingSchema,
  note: z.string(),
  pr: z.string().optional(),
  slug: z.string(),
});
export type ChangeLogEntry = z.infer<typeof ChangeLogEntrySchema>;

// Helper function to map Ring to index (for Zalando format)
export function ringToIndex(ring: Ring): number {
  const mapping: Record<Ring, number> = {
    Adopt: 0,
    Trial: 1,
    Assess: 2,
    Hold: 3,
  };
  return mapping[ring];
}

// Helper function to map Status to moved flag (for Zalando format)
export function statusToMovedFlag(status: Status): number {
  const mapping: Record<Status, number> = {
    New: 2,
    "Moved In": 1,
    "Moved Out": -1,
    "No Change": 0,
  };
  return mapping[status];
}

// Helper function to map quadrant name to index (for Zalando format)
export function quadrantToIndex(quadrant: string, quadrants: string[]): number {
  const index = quadrants.findIndex(
    (q) => q.toLowerCase() === quadrant.toLowerCase()
  );
  if (index === -1) {
    throw new Error(`Unknown quadrant: ${quadrant}`);
  }
  return index;
}

// Validation helper to check if history is consistent with current ring
export function validateHistoryConsistency(blip: BlipFrontMatter): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (blip.history.length > 0) {
    const latestHistory = blip.history[blip.history.length - 1];

    // Check if latest history matches current ring
    if (latestHistory.ring !== blip.ring) {
      errors.push(
        `Latest history entry shows ring "${latestHistory.ring}" but current ring is "${blip.ring}". Please add a history entry or update the ring.`
      );
    }

    // Check if history dates are in chronological order
    for (let i = 1; i < blip.history.length; i++) {
      const prevDate = new Date(blip.history[i - 1].date);
      const currDate = new Date(blip.history[i].date);
      if (currDate < prevDate) {
        errors.push(
          `History entries must be in chronological order: ${blip.history[i].date} comes before ${blip.history[i - 1].date}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
