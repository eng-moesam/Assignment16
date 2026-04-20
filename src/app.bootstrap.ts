import express from "express"
import authController from "./Modules/auth/auth.controller.js"
import globalErrHandling from "./Middlewares/globalErr.midlleware.js"
import { PORT } from "./config/config.service.js"
import DBconnection from "./DB/connection.js"
import { testRedisConnection } from "./DB/Redis/redis.connection.js"
import userController from "./Modules/user/user.controller.js"

async function bootstrap() {
     
  const app :express.Express =express()
  app.use(express.json())
  await DBconnection()
  await testRedisConnection()

  app.get("/",(
    req:express.Request,
    res:express.Response,
    next:express.NextFunction):void=>{

     res.status(200).json({msg:"landing page"})
    })
  
    app.use("/auth",authController)
    app.use("/user",userController)

  app.use("/*dummy",(
    req:express.Request,
    res:express.Response,
    next:express.NextFunction):void=>{

     res.status(404).json({msg:"invalid:url"})
    })
   app.use(globalErrHandling)
      app.listen(PORT,()=>{
        console.log("app listen on port 3000");        
      })
}

export default bootstrap