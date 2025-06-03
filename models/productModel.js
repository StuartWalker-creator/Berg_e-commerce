const mongoose = require('mongoose')
const Category = require('./Category.js')
const User = require('./userModel.js')

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String],
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [String],
  stock: Number,
  basePrice: Number,
  variants: [
    {
      size: String,
      color: String,
      price: Number,
      stock: Number,
      images: [String]
    }
  ],
  isFeatured:{
    type: Boolean,
    default: false
  },
  ratings: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
    }
  }
],
averageRating: {
  type: Number,
  default: 0
},
numOfRatings: {
  type: Number,
  default: 0
}
});

ProductSchema.index({name:'text',description:'text'})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product