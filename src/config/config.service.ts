import dotenv from "dotenv"
import path from 'path';
export const NODE_ENV=process.env.NODE_ENV

// const envpath={
//     dev: path.resolve("./config/.env.dev"),
//     prod:path.resolve("./config/.env.prod")
// }

// dotenv.config({path:envpath[NODE_ENV ||"dev"]})
dotenv.config({path:path.resolve("./.env.dev")})

export const PORT =process.env.port || 3000;
export const DB_URI =process.env.DB_URI || "";
export const DB_URI_ATLAS =process.env.DB_URI_ATLAS || "";
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS as string) ||10;
export const ENCRPTION_KEY = process.env.ENCRPTION_KEY||""
export const TOKEN_SIGNATURE_USER= process.env.TOKEN_SIGNATURE_USER||""
export const TOKEN_SIGNATURE_ADMIN= process.env.TOKEN_SIGNATURE_ADMIN||""
export const TOKEN_SIGNATURE_USER_Refresh= process.env.TOKEN_SIGNATURE_USER_Refresh||""
export const TOKEN_SIGNATURE_ADMIN_Refresh= process.env.TOKEN_SIGNATURE_ADMIN_Refresh||""

export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID||""

export const EMAIL_APP_PASSWORD=process.env.EMAIL_APP_PASSWORD||""
export const EMAIL=process.env.EMAIL||""


export const REDIS_URL = process.env.REDIS_URL||""


export const REGION = process.env.REGION||""
export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID||""
export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY||""
export const BUCKET_NAME = process.env.BUCKET_NAME||""
export const APPLICATION_NAME = process.env.APPLICATION_NAME||""


