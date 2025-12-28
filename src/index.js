import connectDB from "./db/index.js"
import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    const port = process.env.PORT || 8000;
    app.on("error", (error)=>{
        console.log(`Error: ${error}`)
    })
    app.listen(port, ()=>{
        console.log(`Server is runnimg at Port: ${port}`)
    })
})
.catch((error)=>{
    console.log(`MongoDB Connection Failed: ${error}`)
})