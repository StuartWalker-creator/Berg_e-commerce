const express = require('express')
const productRouter = express.Router()
const {
   getProducts
  ,getSingleProduct
  ,getCategories
  ,getProductsByCategory
  ,getFeaturedProducts
  ,autoComplete
  ,searchProducts
  ,getProductsByCatalog
  ,getCatalogs
  ,rateProduct
} = require('../controllers/product-controller.js')
 const jwt_auth = require('../middleware/jwt-auth.js')
 
productRouter.get('/:lastId',getProducts)
productRouter.get('/:id',getSingleProduct)
productRouter.get('/categories',getCategories)
productRouter.get('/categories/:id',getProductsByCategory)
productRouter.get('/featured',getFeaturedProducts)
productRouter.get('/autocomplete',autoComplete)
productRouter.get('/search/:lastId',searchProducts)
productRouter.get('/catalogs/:lastId',getCatalogs)
productRouter.get('/catalogs/:catalogId',getProductsByCatalog)
productRouter.get('/rate/:productId',jwt_auth,rateProduct)

module.exports = productRouter