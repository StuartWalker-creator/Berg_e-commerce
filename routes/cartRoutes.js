const express = require('express')
const jwt_auth = require('../middleware/jwt-auth.js')

const cartRouter = express.Router()

const {getCart,addToCart,updateItem,removeItem,clearCart} = require('../controllers/cart-controller.js')

cartRouter.get('/', jwt_auth, getCart);
cartRouter.post('/add', jwt_auth, addToCart);
cartRouter.patch('/update/:productId', jwt_auth, updateItem);
cartRouter.delete('/remove/:productId', jwt_auth, removeItem);
cartRouter.delete('/clear', jwt_auth, clearCart);

module.exports = cartRouter