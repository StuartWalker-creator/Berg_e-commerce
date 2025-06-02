//import fetch from 'node-fetchc'
const Order = require('../models/orderModel.js')
const requestMtnToken = require ('./requestmtntoken.js')

async function pollPaymentStatus(referenceId) {
  const momoHost = "https://sandbox.momodeveloper.mtn.com"
  //process.env.MOMO_BASE_URL

  const token = await requestMtnToken();

  const res = await fetch(`${momoHost}/collection/v1_0/requesttopay/${referenceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Target-Environment': process.env.MTN_TARGET_ENV,
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY
    }
  });

  const data = await res.json();

  if (data.status === 'SUCCESSFUL') {
    await Order.findOneAndUpdate({ referenceId }, { status: 'paid' });
    console.log(`✅ Order ${referenceId} marked as PAID`);
  } else if (data.status === 'FAILED') {
   await Order.findOneAndUpdate({ referenceId }, { status: 'FAILED' });
    console.log(`❌ Order ${referenceId} marked as failed`);
  } else {
    console.log(`⌛ Still pending: ${referenceId}`);
  }
}

module.exports = pollPaymentStatus