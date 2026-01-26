import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import messageRouter from "./routes/message.routes.js"
import groupRouter from "./routes/group.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/message", messageRouter)
app.use("/api/v1/groups", groupRouter)
export { app }