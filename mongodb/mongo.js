const mongoose = require('mongoose')

const connectDB = async () => {
  try{
  await mongoose.connect(process.env.MONGO_URL)
  console.log('👼👼🧘Mongodb connected successfuly')
  } catch (e) {
    console.log('👽👽👺 error occurred connecting mongodb',e)
  }
}

module.exports = connectDB