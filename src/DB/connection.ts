import { connect } from "mongoose";
import { DB_URI, DB_URI_ATLAS } from "../config/config.service.js";

async function DBconnection(){
    try {
        await connect(DB_URI_ATLAS)
         console.log('Database Connected Successfully');
    } catch (error) {
        console.log("DB Connetion Failed",error);
        
    }
}

export default DBconnection