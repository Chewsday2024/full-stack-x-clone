import express from 'express'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import connectMongoDB from './db/connectMongoDB'
import cookieParser from 'cookie-parser'


const PORT = process.env.PORT || 9000

dotenv.config()
const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())




app.use('/api/auth', authRoutes)




app.listen( PORT , () => {
  console.log(`SIR！You make it HERE！AT ${PORT}`)
  connectMongoDB()
})