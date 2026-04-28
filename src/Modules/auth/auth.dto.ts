import type  z from "zod";
import type { confrimEmailSchema, loginSchema, resetPasswordSchema, signUpSchema, verfiyForgetPassoerdOtpSchema } from "./auth.validation.js";

// export interface loginDTO {
//     email: string; password: string
// }
export type loginDTO   = z.infer<typeof loginSchema.body>
export type singnUpDTO = z.infer<typeof signUpSchema.body>
export type confrimEmailDTO = z.infer<typeof confrimEmailSchema.body>
export type verfiyOtpForgetPasswordDTO = z.infer<typeof verfiyForgetPassoerdOtpSchema.body>
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema.body>

// export interface singnUpDTO extends loginDTO {
//      userName: number;
// }