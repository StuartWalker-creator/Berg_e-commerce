const express = require('express')
const orderRouter = express.Router()
const {
  getOrders,
  getOrderById,
  placeOrderForCod,
  placeOrderForMTN,
  placeOrderForAirtel
} = require('../controllers/order-controller.js')

const acc_auth = require('../middleware/accessAuth.js')

orderRouter.post('/cod',placeOrderForCod)
orderRouter.post('/mtn',placeOrderForMTN)
orderRouter.post('/airtel',placeOrderForAirtel)

orderRouter.get('/getAll',acc_auth,getOrders)
orderRouter.get('/getOne/:orderId',getOrderById)


module.exports = orderRouter