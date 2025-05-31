const express = require('express')
const orderRouter = express.Router()

const {
  createOrder,
  getOrders,
  getOrderById
  
} = require('../controllers/order-controller.js')
const acc_auth = require('../middleware/accessAuth.js')

orderRouter.post('/create',createOrder)
orderRouter.get('/getAll',acc_auth,getOrders)
orderRouter.get('/getOne/:orderId',getOrderById)


module.exports = orderRouter