const Order = require('../models/orderModel.js')
const Product = require('../models/productModel.js')
const Flutterwave = require('flutterwave-node-v3')

const createOrder = async (req,res,next) => {
  
  const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

  const {
    items, total, shippingAddress, email, phone, paymentMethod, isGuest, userId,deliveryOption
  } = req.body;

  const tx_ref = "tx_" + Date.now();

  const newOrder = new Order({
    userId: userId || null,
    items,
    total,
    shippingAddress,
    email,
    phone,
    deliveryOption,
    paymentMethod,
    isGuest,
    tx_ref,
  });

  try {
    await newOrder.save();

    if (paymentMethod === "cod") {
      await Order.findOneAndUpdate({tx_ref:tx_ref},{
        paymentStatus:'pending'
      })
      return res.status(200).json({ message: "Order placed for Cash on Delivery" ,newOrder});
    }

    const payload = {
      tx_ref,
      amount: total,
      currency: "UGX",
      payment_type: paymentMethod === "mtn" ? "mobilemoneyuganda" : "mobilemoneyuganda",
      redirect_url: "http://localhost:4000/payment-success",
      customer: { email, phonenumber: phone, name: email.split("@")[0] },
      customizations: { title: "Electro Nics store", description: "Order Payment" },
    };

    const response = await flw.MobileMoney.uganda(payload);

    res.status(200).json({ paymentLink: response.meta.authorization.redirect });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
}

const getOrders = async (req,res,next) => {
  try {
    let orders;
    if (req.user._id) {
      orders = await Order.find({userId:req.user._id}).sort({createdAt:1}).limit(10)
    }
    else {
      orders = await Order.find({_id:{$in:req.body.ids}})
    }
    if (!orders) {
      res.status(405)
      return next(new Error('no orders found'))
    }
    
    res.status(200).json(orders)
  } catch (e) {
    throw new Error('something went wrong!'+e)
  }
}

const getOrderById = async (req,res,next) => {
  try {
    let {orderId} = req.params
    
    if (!orderId) {
      res.status(400)
      return next(new Error('no order id provided'))
    }
    
    let order = await Order.findById(orderId)
    
    if (!order) {
      res.status(404)
      return next(new Error('Order not found'))
    }
    
    res.status(200).json(order)
  } catch (e) {
    throw new Error("couldn't get order!"+e)
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
}
