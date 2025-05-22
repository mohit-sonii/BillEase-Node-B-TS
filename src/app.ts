import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoute from './routes/auth.routes'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use("/auth",authRoute)

app.listen(process.env.PORT, () => {
    console.log(`Application is running on PORT: ${process.env.PORT}`)
})

export { app }