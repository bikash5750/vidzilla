
import {app} from "./app.js"
import dotenv from "dotenv";
import { connectdb } from "./src/dbconnection/dbindex.js";

dotenv.config({ path: "./.env" }); 


connectdb()
.then(()=>{
  listen(3000, () => {
    console.log("Your application is running on port 3000");
  })
})
.catch((err) =>{
  `mongodb connection failed !!!!`
})

