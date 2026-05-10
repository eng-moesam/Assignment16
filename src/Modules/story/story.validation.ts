import z from "zod";

export const createStorySchema = {
    body: z.object({
        caption: z.string().max(200).optional(),
    }),
};

