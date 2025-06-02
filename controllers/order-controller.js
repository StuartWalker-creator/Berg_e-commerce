const Order = require('../models/orderModel.js')
const sendEmail = require('../utils/sendEmail.js')
const pollPaymentStatus = require('../utils/mtnpollpayment.js')
const requestMtnToken = require('../utils/requestmtntoken.js')

const {v4:uuidv4}= require('uuid')

const placeOrderForCod = async (req,res,next) => {
  try {
    const {
    items, total, shippingAddress, email, phone, paymentMethod, isGuest, userId,deliveryOption
  } = req.body;

if (paymentMethod != 'cod') {
  res.status(400)
  return next(new Error('Request forbidden! supposed to be for cod'))
}

if (!items || !email) {
  res.status(400)
  return next(new Error('provide the necessities please'))
}

const tx_ref = `TX_${Date.now()}`

 const newOrder = await Order.create({
  userId: userId || null,
  items,
  email,
  phone,
  total,
  isValid: true,
  shippingAddress,
  deliveryOption,
  paymentMethod,
  paymentStatus:'pending',
  isGuest: isGuest,
  tx_ref
})

await sendEmail(newOrder)

res.status(201).json({message:'Order created successfully for cash on delivery!',newOrder})
  } catch (e) {
    throw e
  }
}

const placeOrderForMTN = async (req,res,next) => {
  try {
   const {
    items, total, shippingAddress, email, phone, paymentMethod, isGuest, userId,deliveryOption
  } = req.body;
  
    const token = await requestMtnToken();
    const referenceId = uuidv4();

    const momoHost = process.env.MOMO_BASE_URL;

    const requestUrl = `${momoHost}/collection/v1_0/requesttopay`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': process.env.MTN_TARGET_ENV,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
    };

    const body = {
      amount: total.toString(),
      currency: 'UGX',
      externalId: referenceId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone,
      },
      payerMessage: 'Payment for your order',
      payeeNote: 'Thanks for shopping',
    };

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 202) {
        const newOrder = await Order.create({
    userId: userId|| null,
    items,
    total,
    phone,
    email,
    shippingAddress,
    deliveryOption,
    paymentMethod,
    isGuest: isGuest,
    isValid: false,
    tx_ref:referenceId
  })
  
  setTimeout(() => {
      pollPaymentStatus(referenceId);
    }, 10000);

      return res.status(200).json({
        message: 'Payment request sent successfully',
        referenceId,
      });
    } else {
      const error = await response.text();
      return res.status(400).json({ error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const placeOrderForAirtel = async (req,res,next) => {
  try{
   const {
    items, total, shippingAddress, email, phone, paymentMethod, isGuest, userId,deliveryOption
  } = req.body;
  
  const reference = uuidv4()
  const tx_ref = `TX_${Date.now}`
  
    const tokenRes = await fetch('https://openapi.airtel.africa/auth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.AIRTEL_CLIENT_ID,
            client_secret: process.env.AIRTEL_CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const paymentRes = await fetch('https://openapi.airtel.africa/merchant/v1/payments/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reference,
            subscriber: {
                country: process.env.AIRTEL_COUNTRY,
                currency: process.env.AIRTEL_CURRENCY,
                msisdn: phone
            },
            transaction: {
                amount: total.toString(),
                country: process.env.AIRTEL_COUNTRY,
                currency: process.env.AIRTEL_CURRENCY,
                id: tx_ref,
                reference
            }
        })
    });
    
  const newOrder = await Order.create({
    userId: userId|| null,
    items,
    total,
    phone,
    email,
    shippingAddress,
    deliveryOption,
    paymentMethod,
    isGuest: isGuest,
    isValid: false,
    tx_ref:reference
  })
  
    if (!paymentRes.ok) {
        const error = await paymentRes.text();
        throw new Error(`Airtel Payment Error: ${error}`);
    }

     await paymentRes.json();
     
     res.status(200).json({
       message:'Transaction initiated with Airtel, waiting for confirmation'
     })

}
  catch (e) {
    return next(new Error('Server Error'+e))
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
  getOrders,
  getOrderById,
  placeOrderForCod,
  placeOrderForMTN,
  placeOrderForAirtel
}
