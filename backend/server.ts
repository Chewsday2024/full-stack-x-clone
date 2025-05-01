import cookieParser from 'cookie-parser'
import { v2 as cloudinary} from 'cloudinary'
import express from 'express'
import dotenv from 'dotenv'


import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import postRoutes from './routes/post.routes'
import notificationRoutes from './routes/notification.routes'

import connectMongoDB from './db/connectMongoDB'

const PORT = process.env.PORT || 9000

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())




app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/notifications', notificationRoutes)




app.listen( PORT , () => {
  console.log(`SIR！You make it HERE！AT ${PORT}`)
  connectMongoDB()
})