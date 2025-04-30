import express from 'express'


const PORT = process.env.PORT || 9000


const app = express()




app.listen( PORT , () => {
  console.log(`SIR！You make it HERE！AT ${PORT}`)
})