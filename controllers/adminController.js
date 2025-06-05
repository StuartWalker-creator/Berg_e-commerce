const mongoose = require('mongoose')
const fs = require('fs/promises')
const Product = require('../models/productModel.js')
const User = require('../models/userModel.js')
const Order = require('../models/orderModel.js')
const Catalog = require('../models/CatalogModel.js')
const Category = require('../models/Category.js')

const cloudinary = require('cloudinary').v2
    
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret:process.env.API_SECRET
})

const createProduct = async (req,res,next) => {
  console.log('here ww start')
  try {
    let {title,description,stock,basePrice, variants} = req.body
console.log(variants)
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
      const fieldKey = `variantImages${index}`;
      const images = grouped[fieldKey] || [];

      const uploadedImages = await Promise.all(
        images.map(async (file) => {
          const res = await cloudinary.uploader.upload(file.path, {
            folder: 'products'
          });
          fs.unlinkSync(file.path);
          return res.secure_url;
        })
      );

      return { ...variant, images: uploadedImages };
    })
  );

  const product = new ProductModel({
    title,
    description,
    basePrice:Number(basePrice),
    images: grouped.productImages || [],
    stock:Number(stock),
    variants: finalVariants,
  });

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
  
    if (lastId) {
    query = {
      _id:{$lt:lastId}
    }
  }
  
  const orders = await Order.find({...query}).sort({_id:-1}).limit(10)
  
  if (!orders) {
    res.status(400)
    return next(new Error('orders not found'))
  }
  
  console.log('orders',orders)
  res.status(200).json(orders)
  } catch (e) {
    res.status(500)
    return next(new Error('error occured: '+e))
  }
}

const getAllUsers = async (req,res,next) => {
  const {lastId} = req.params
  
  try {
    
  let query = {}
  
    if (lastId) {
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

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  makeFeatured,
  getAllOrders,
  updateStatus,
  getAllUsers,
  promoteUser,
  deleteUser
}