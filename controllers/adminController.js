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
  try {
    const {title,description,stock,basePrice, variants} = req.body

  variants = variants.map(variant => {
    variant.stock = Number(variant.stock)
    variant.price = Number(variant.price)
    
    return variant
  })
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
    throw e
  }
}

module.exports = {
  createProduct
}