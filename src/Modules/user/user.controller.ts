import  express  from 'express';
import { auth } from '../../Middlewares/authentication.middleware.js';
const userController =express.Router()

userController.get("/",auth(),(req,res)=>{
    return res.status(200).send("user cotroller page")
    
})


export default userController