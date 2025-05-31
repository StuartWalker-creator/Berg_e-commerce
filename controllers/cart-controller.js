const mongoose = require('mongoose')
const Cart = require('../models/CartModel.js')
const Product = require('../models/productModel.js')

// GET /cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
  res.json(cart || { items: [] });
};

// POST /cart/add

const addToCart =  async (req, res) => {
  const { productId,variant, quantity } = req.body;

  const product = await Product.findById(productId);
  
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const selectedVariant = product.variants[variant]
  
  if (!selectedVariant) return res.status(400).json({ error: 'Variant not found' });

  if (selectedVariant.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const existingItem = cart.items.find(item =>
    item.productId.equals(productId) &&
    item.variant.size === size &&
    item.variant.color === color
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      variant: selectedVariant,
      quantity
    });
  }

  await cart.save();
  res.status(200).json(cart);
}

// PATCH /cart/update/:productId
const updateItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity, variant } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });
  const item = cart.items.find(item => item.productId.equals(productId) && item.variant === variant);

  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
};

// DELETE /cart/remove/:productId
const removeItem = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });
  cart.items = cart.items.filter(item => !item.productId.equals(productId));
  await cart.save();
  res.json(cart);
};

// DELETE /cart/clear
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
  res.json({ message: 'Cart cleared' });
};



module.exports = {
  getCart,
  clearCart,
  removeItem,
  updateItem,
  addToCart
}
