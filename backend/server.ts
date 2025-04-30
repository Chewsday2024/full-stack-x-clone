import express from 'express'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import connectMongoDB from './db/connectMongoDB'


const PORT = process.env.PORT || 9000

dotenv.config()
const app = express()




app.use('/api/auth', authRoutes)




app.listen( PORT , () => {
  console.log(`SIR！You make it HERE！AT ${PORT}`)
  connectMongoDB()
})