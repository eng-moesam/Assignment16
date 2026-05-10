import z from "zod"
export const logoutSchema ={
    body: z.object({
        logoutOptions:z.enum(["all","one"])
    })
}
export const profilPicSchema ={
    body: z.object({
originalname:z.string()
,ContentType:z.string()    })
}