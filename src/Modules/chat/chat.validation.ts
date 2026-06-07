import z from "zod";
import { commonValidationFileds } from "../../Middlewares/valdation.middleware.js";

const messageSchema = z.object({
    content: z.string().optional(),
    tags: z.array(commonValidationFileds.id).optional(),
    attachments: z.array(z.string()).optional(),
    files: z.array(z.any()).optional(),
});

export const sendMessageSocketSchema = messageSchema
    .extend({ sendTo: commonValidationFileds.id })
    .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "you should add content at least or one atthchment",
            });
        }

        if (args.tags && new Set(args.tags).size != args.tags.length) {
            ctx.addIssue({ code: "custom", path: ["tags"], message: "dublected tags" });
        }
    });

export const sendGroupMessageSocketSchema = messageSchema
    .extend({ groupId: commonValidationFileds.id })
    .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "you should add content at least or one atthchment",
            });
        }

        if (args.tags && new Set(args.tags).size != args.tags.length) {
            ctx.addIssue({ code: "custom", path: ["tags"], message: "dublected tags" });
        }
    });

export const sendMessageSchema = { body: sendMessageSocketSchema };
export const sendGroupMessageSchema = { body: sendGroupMessageSocketSchema };

export const reactMessageSchema = {
    query: z.object({ react: z.coerce.number() }),
    params: z.object({
        chatId: commonValidationFileds.id,
        messageId: commonValidationFileds.id,
    }),
};

export const reactMessageSocketSchema = z.object({
    chatId: commonValidationFileds.id,
    messageId: commonValidationFileds.id,
    react: z.coerce.number(),
});

export const testSchema = z.object({ chatId: z.string().min(2) });

