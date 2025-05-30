const mongoose = require('mongoose')
const User = require('./userModel.js')
const Cart = require('./CartModel.js')
const Product = require('./productModel.js')

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity:{
        type:Number,
        default: 1
      },
      variant: {
      size: String,
      color: String,
      price: Number,
      stock: Number,
      images: [String]
      }
    }
  ],
  total: Number,
  shippingAddress: String,
  email: String,
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending'},
  paymentStatus:{
    type:String,
    enum:['pending','paid','failed']
  },
  isGuest: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order',OrderSchema)

module.exports = Order
