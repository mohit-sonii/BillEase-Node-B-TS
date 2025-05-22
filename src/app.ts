import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoute from './routes/auth.routes'
import bookRoute from './routes/book.routes'
import reviewRoute from './routes/review.routes'
import searchRoute from './routes/search.routes'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use("/auth",authRoute)
app.use("/books",bookRoute)
app.use("/review",reviewRoute)
app.use("/search",searchRoute)

app.listen(process.env.PORT, () => {
    console.log(`Application is running on PORT: ${process.env.PORT}`)
})

export { app }