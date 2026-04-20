import { connect } from "mongoose";
import { DB_URI } from "../config/config.service.js";

async function DBconnection(){
    try {
        await connect(DB_URI)
         console.log('Database Connected Successfully');
    } catch (error) {
        console.log("DB Connetion Failed",error);
        
    }
}

export default DBconnection