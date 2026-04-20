import type  z from "zod";
import type { confrimEmailSchema, loginSchema, signUpSchema } from "./auth.validation.js";

// export interface loginDTO {
//     email: string; password: string
// }
export type loginDTO   = z.infer<typeof loginSchema.body>
export type singnUpDTO = z.infer<typeof signUpSchema.body>
export type confrimEmailDTO = z.infer<typeof confrimEmailSchema.body>

// export interface singnUpDTO extends loginDTO {
//      userName: number;
// }