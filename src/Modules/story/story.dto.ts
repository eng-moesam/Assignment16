import type z from "zod";
import type { createStorySchema } from "./story.validation.js";

export type StoryCreateDTO = z.infer<typeof createStorySchema.body>;
