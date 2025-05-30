const mongoose = require('mongoose')
const Product = require('./productModel.js')

const CatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: {type:String,
    required:true
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Catalog = mongoose.model('Catalog',CatalogSchema)

module.exports = Catalog
