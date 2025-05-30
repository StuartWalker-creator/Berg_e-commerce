const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv= require('dotenv')
const path = require('path')
const userRouter= require('./routes/userRoute.js')
const productRouter = require('./routes/productRoute.js')
const cartRouter = require('./routes/cartRoutes.js')
const connectDB = require('./mongodb/mongo.js')
const errorHandler = require('./middleware/error-handler.js')

dotenv.config()

const app = express()
app.use(cors())

const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({extended:true}))

connectDB()
app.use('/users',userRouter)
app.use('/products',productRouter)
app.use('/cart',cartRouter)

app.use(errorHandler)

const PORT = process.env.PORT

server.listen(PORT,()=>{
  console.log('🚀🚀🤑💯 Electronics server connected with pride🚀 at port:'+PORT)
})

app.use((req, res, next) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

