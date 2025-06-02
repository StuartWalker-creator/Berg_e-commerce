//const fetch from 'node-fetch';
const { v4:uuidv4 } = require('uuid')

const momoHost = "https://sandbox.momodeveloper.mtn.com"
//process.env.MOMO_BASE_URL

async function requestMtnToken() {
  const userId = process.env.MTN_USER_ID;
  const apiKey = process.env.MTN_API_KEY;
  const basicAuth = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  const res = await fetch(`${momoHost}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
    },
  });

  const data = await res.json();
  
  return data.access_token;
}

module.exports = requestMtnToken