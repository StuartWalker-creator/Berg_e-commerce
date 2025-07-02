const mongoose = require('mongoose')
const Product = require('../models/productModel.js')
const Category = require('../models/Category.js')
const Catalog = require('../models/CatalogModel.js')

const getProducts = async (req,res,next) => {
  try {
    console.log('initial')
    let {lastId} = req.params
    const limit = 10
    
    console.log('first')
    let idQuery = mongoose.Types.ObjectId.isValid(lastId)? {_id:{$lt:lastId}} : {}
    console.log('second')
    const products = await Product.find({...idQuery}).sort({_id:-1}).limit(limit).populate('ratings.user','name email profilePictureURL')
    .populate('category','name description')
    
    console.log('third')
    console.log(products)
    if (products.length == 0) {
      return res.status(204).json(products)
      
    }
    
    res.status(200).json(products)
    
    console.log('Products',products)
    
  } catch (e) {
console.log(e)
    res.status(500)
    throw e
  }
}

const getSingleProduct = async (req,res,next) => {
  try {
    const productId = req.params.id
    if (!productId) {
      res.status(401)
      return next(new Error('No id provided'))
    }
    
    const product = await Product.findById(productId)
    
    if (!product) {
      res.status(204)
      return next(new Error('No product found'))
    }
    res.status(200).json(product)
  } catch (e) {
    throw e
  }
}

const getCategories = async (req,res,next) => {
  try {
    const lastId = req.query.lastId
    const limit = req.query.limit
    query = lastId ? {_id:{$lt:lastId}} : {}
    
    const categories = await Category.find(query).sort({_id:-1}).limit(Number(limit))
    
    if (categories.length==0) {
      res.status(204)
      return next(new Error('No more categories'))
    }
    
    res.status(200).json(categories)
    
  } catch (e) {
    throw new Error('Server Error'+e)
  }
}

const getProductsByCategory= async (req,res,next) => {
  
  try {
    const categoryId = req.params.id
    const lastId = req.query.lastId
    
    const query = lastId ? {_id:{$lt:lastId}} : {}
    
    const products = await Product.find({category:categoryId,...query}).sort({_id:-1}).limit(10).populate('ratings.user', 'name email profilePictureURL')
    
    if (products.length == 0) {
      res.status(204)
      return next(new Error('No products found'))
    }
    
    res.status(200).json(products)
  } catch (e) {
    console.log('error: ',e)
    throw new Error('Server error')
  }
}

const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true });

    // , shuffle array
    featuredProducts.sort(() => 0.5 - Math.random());

    res.status(200).json({ featured: featuredProducts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch featured products.' });
  }
};

const autoComplete = async (req,res,next) => {
    const q = req.query.q;
  console.log('query: ', q)
  if (!q) return res.json([]);
  
  const suggestions = await Product
    .find({$or:[
      { title: { $regex: `^${q}`, $options: "i" } },
      {category: {$regex: `^${q}`}}
    ]})
    .limit(10)
    .select("title");
  
  res.json(suggestions.map(v => v.title));
}

const searchProducts = async (req, res) => {
  
 const query = req.query.q;
 const {lastId} = req.params
  
  let searchQuery = lastId ? {_id:{$lt:lastId}} : {}
  
  if (!query) return res.status(400).json({ message: 'Search query missing' });

  // Get matched products
  const matched = await Product.find(
    { $text: { $search: query },...searchQuery},
    { score: { $meta: "textScore" } },
  ).sort({ score: { $meta: "textScore" } });

  // If matches are few, get some fallback
  let fallback = [];
  
  if (matched.length < 5) {
    fallback = await Product.find({ _id: { $nin: matched.map(p => p._id) } }).limit(10).sort({ createdAt: -1 });
  }

  res.json({ matched, fallback });
};

const getCatalogs = async (req,res,next) => {
  console.log('were getting catalogs')
  try {
    const catalogs = await Catalog.find()
    
    console.log('catalogs',catalogs)
    let status = 200
    if (catalogs.length==0) {
     status = 200
    }
    
    res.status(status).json(catalogs)
    
  } catch (e) {
    console.log(e)
    res.status(500)
    throw e
  }
}

const getProductsByCatalog = async (req,res,next) =>{
   const {catalogId} = req.params
   
   if (!catalogId) {
     res.status(401)
     return next(new Error('no catalog-id provided'))
   }
   
   const catalog = await Catalog.findById(catalogId).populate('products')
   
   if (!catalog) {
     res.status(400)
     return next(new Error('No catalogs found'))
   }
   
   res.status(200).json(catalog)
}

const rateProduct = async (req,res,next) => {
  try {
    let {productId} = req.params
    
    if (!productId) {
      res.status(404)
      return next(new Error('no product id provided'))
    }
    
    let {stars,comment} = req.body
    
    if (!stars || !comment) {
      res.status(400)
      return next(new Error('Missing information ℹ️'))
    }
    
    let product = await Product.findById(productId)
    
    if (!product) {
      res.status(404)
      return next(new Error('Product not found'))
    }
    
    let rating = {
      user: req.user._id,
      rating: Number(stars),
      comment: comment
    }
    
    product.numOfRatings += 1
    
    let numRate = 0
    
    product.ratings.forEach((rating)=>{
      numRate += rating.rating
    })
    
    product.averageRating = numRate / product.numOfRatings
    product.ratings.unshift(rating)
    
    await product.save
    
    res.status(200).json(rating)
    
  } catch (e) {
    throw new Error('Error rating product'+e)
  }
}

module.exports = {
  getProducts,
  getSingleProduct,
  getCategories,
  getCatalogs,
  getProductsByCatalog,
  getProductsByCategory,
  getFeaturedProducts,
  autoComplete,
  searchProducts,
  rateProduct
}
