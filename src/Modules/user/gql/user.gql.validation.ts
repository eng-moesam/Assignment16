import z from "zod"
import { commonValidationFileds } from "../../../Middlewares/valdation.middleware.js"

export const getProfilePicschema= z.object({
    userId :commonValidationFileds.id
}) 