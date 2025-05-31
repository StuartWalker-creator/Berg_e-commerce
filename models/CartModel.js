const mongoose = require('mongoose')
const User =  require('./userModel.js')
const Product =  require('./productModel.js')

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  ]
});

const Cart = mongoose.model('Cart',CartSchema)

module.exports = Cart