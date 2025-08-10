const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs/promises')
const Product = require('../models/productModel.js')
const User = require('../models/userModel.js')
const Order = require('../models/orderModel.js')
const Catalog = require('../models/CatalogModel.js')
const Category = require('../models/Category.js')

const cloudinary = require('cloudinary').v2
    
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})

const createProduct = async (req,res,next) => {
  console.log('here ww start')
  try {
    let {title,description, variants} = req.body

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})

console.log(process.env.API_KEY)
const basePrice = variants[0].price

let stock = 0

variants.forEach((variant)=>{
  stock+=Number(variant.stock)
}
)

  variants = variants.map(variant => {
    variant.stock = Number(variant.stock)
    variant.price = Number(variant.price)
    
    return variant
  })
  
  console.log(variants)
  const files = req.files;

  // Group files by field name
  const grouped = {};
  for (const file of files) {
    if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
    grouped[file.fieldname].push(file);
  }

  // Upload to Cloudinary and link to variant index
  const finalVariants = await Promise.all(
    variants.map(async (variant, index) => {
      const fieldKey = `variants[${index}][images]`;
      const images = grouped[fieldKey] || [];

      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          const res = await cloudinary.uploader.upload(file.path, {
            folder: 'products'
          });
          await fs.unlink(file.path);
          return res.secure_url;
        })
      );

      return { ...variant, images: uploadedImages };
    })
  );

  const product = new Product({
    title,
    description,
    basePrice:basePrice,
    images: finalVariants[0].images || [],
    stock:Number(stock) || stock,
    variants: finalVariants,
  });

console.log('Product',product)

  await product.save();
  res.status(201).json(product);

  } catch (e) {
    console.log('error',e)
    throw new Error('Error occured: '+e)
  }
}

const updateProduct = async (req,res,next) => {
  console.log('start updateing')
  try {
    const {id} = req.params
    
    let product = await findById(id)
    
    if (!product) {
      res.status(404)
      return next(new Error('Product not found'))
    }
    
    const {title,stock, description,basePrice,variants} = req.body
    
    console.log(title,stock, description,basePrice,variants)
    
    const updateQuery = {}

    if (title) {
      updateQuery.title=title
    }
    if (stock) {
      updateQuery.stock=Number(stock)
    }
    if (description) {
      updateQuery.description=description
    }
    if (basePrice) {
      updateQuery.basePrice=Number(basePrice)
    }
  
  product = await Product.findByIdAndUpdate(id,updateQuery)
  
if (variants &&  variants.length>0) {
    
  for (let variant of variants) {
        const targetVariant = product.variants[variant.id] || []
        
   for (const key in variant) {
     if (key in targetVariant) {
      targetVariant[key] = variant[key];
    }
    
  }
  
  product.variants[variant.id] = targetVariant
      }
      
     await product.save()
  }
  console.log('Its done!',product)
  res.status(200).json(product)
  } catch (e) {
    console.log('error: ',e)
    throw new Error('Error occured while updating'+e)
  }
}

const deleteProduct = async (req,res,next) => {
  console.log('start of deleting')
  try {
    const {id} = req.params
    
    await Product.deleteOne({id})
    
    res.status(200).json({message:'Product successfully deleted!'})
    
  } catch (e) {
    console.log(e)
    throw new Error('Error occurred during deleting: '+e)
  }
}

const makeFeatured = async (req,res,next) => {
  
  const {id} = req.params
  try {
    const product = await Product.findByIdAndUpdate(id,{
      isFeatured:!isFeatured
    })
    
    console.log(product)
    
    res.status(200).json(product)
  } catch (e) {
    console.log(e)
    throw new Error('Error at making featured: '+e)
  }
}

const getAllOrders = async (req,res,next) => {
  const {lastId} = req.params
  
  try {
    
  let query = {}
  
    if (mongoose.Types.ObjectId.isValid(lastId)) {
    query = {
      _id:{$lt:lastId}
    }
  }
  
  const orders = await Order.find({...query}).sort({_id:-1}).limit(10).populate('userId','name')
  
  if (!orders) {
    res.status(400)
    return next(new Error('orders not found'))
  }
  
  console.log('orders',orders)
  res.status(200).json(orders)
  } catch (e) {
    console.log(e)
    res.status(500)
    return next(new Error('error occured: '+e))
  }
}

const getAllUsers = async (req,res,next) => {
  const {lastId} = req.params
  console.log('start')
  console.log(lastId)
  try {
    
  let query = {}
  
    if (mongoose.Types.ObjectId.isValid(lastId)) {
    query = {
      _id:{$lt:lastId}
    }
  }
  
  const users = await User.find({...query}).sort({_id:-1}).limit(10)
  
  if (!users) {
    res.status(400)
    return next(new Error('users not found'))
  }
  
  console.log('users',users)
  res.status(200).json(users)
  } catch (e) {
    console.log(e)
    res.status(500)
    return next(new Error('error occured: '+e))
  }
}

const updateStatus = async (req,res,next) => {
  try {
    
  let {id} = req.params
  
  let {status} = req.query
  
  const order = await Order.findByIdAndUpdate(id,{
    status:status
  })
  
  if (!order) {
    res.status(404)
    return new Error('Order not found')
  }
  
  res.status(200).json(order)
}
catch (e) {
  console.log(e)
  
  res.status(500)
  return next(new Error('Server error: '+e))
}
}

const promoteUser = async (req,res,next) => {
  try {
    let {id} = req.params
    
    let {role} = req.query
    
    if (!role) {
      res.status(400)
    }
    return next(new Error('Role must be provided'))
    
    const user = await User.findByIdAndUpdate(id,{
      role:role
    })
    
    console.log(user)
    
    res.status(200).json(user)
  } catch (e) {
    throw e
  }
}

const deleteUser = async (req,res,next) => {
  try {
    const {id} = req.params
    
    await User.deleteOne({_id:id})
    
    res.status(200).json({
      message:'User deleted successfully!'
    })
  } catch (e) {
    throw e
  }
}
const getProducts = async (req,res,next) => {
  try {
    
    const {lastId} = req.params
    
    let query = {}
    
    if (mongoose.Types.ObjectId.isValid(lastId)) {
      query={_id:{$lt: lastId}}
    }
   const products = await Product.find({...query}).sort({_id:-1}).limit(10)
   
   console.log('gotten products pro',products)
   
   res.status(200).json(products)
  } catch (e) {
    console.log(e)
    throw e
  }
}

const getOrders  = async (req,res,next) => {
    try {
   const orders = await Order.find()
   
   res.status(200).json({
     quantity:orders.length
   })
  } catch (e) {
    throw e
  }
}

const login = async (req,res,next)=>{
  try {
  const {password,email} = req.body
  
  if (!password || !email) {
    res.status(400)
    return next(new Error('All fields are mandatory!'))
  }
  
  const user = await User.findOne({email})
  
  if (!user) {
    res.status(404)
    return next(new Error('No user found'))
    
  }
  
  console.log('password',password)
  
 let isMatch = await bcrypt.compare(password,user.password)
  
  if (!isMatch) {
    res.status(404)
    return next(new Error('User not authorized, check password and try again!'))
  }
  
  let authorizedRoles = [
    'admin','owner'
  ]
if (!(authorizedRoles.includes(user.role))) {
  res.status(404)
  return next(new Error('User not authorized'))
}

const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d'})

console.log('adminToken',token)

res.status(200).json({user,token})
  } catch (e) {
    throw e
  }
}
const getAllProducts = async (req,res,next) => {
  try {
    const products = await Product.find()
    
    const productsLength = products.length
    
    res.status(200).json({
      quantity:productsLength
    })
  } catch (e) {
    throw e
  }
}
const getCatalogs = async (req,res,next) => {
  
}
const updateProductVariant = async (req,res,next) => {
  console.log('I am updating the values of the variants')
  
  const { productId, index } = req.params;
  const { price, stock, color, size } = req.body;
  
  cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})


  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const variant = product.variants[index];
  if (!variant) return res.status(404).json({ message: "Variant not found" });

  variant.price = price;
  variant.stock = stock;
  if (color) variant.color = color;
  if (size) variant.size = size;

if (req.files && req.files.length > 0) {
  console.log('files',req.files)
  const imageUploadPromises = req.files.map(async file => {
    const res = await cloudinary.uploader.upload(file.path, {
      folder: 'products-variants'
    });
    await fs.unlink(file.path);
    return res.secure_url;
  });

  variant.images = await Promise.all(imageUploadPromises);
}
  await product.save();
  res.json(product);
}
module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  makeFeatured,
  getAllOrders,
  updateStatus,
  getAllUsers,
  promoteUser,
  deleteUser,
  getProducts,
  getOrders,
  login,
  getAllProducts,
  getCatalogs,
  updateProductVariant
}