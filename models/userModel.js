const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required:true,
    validate:[
      validator.isEmail,'Please enter a valid email'
    ]
  },
  password: String,
  role: {
  type: String,
  enum: ['user', 'admin', 'owner'],
  default: 'user'
},
  preferences:{
    searchHistory:[String],
    orderHistory:[String]
  },
  address: String,
});

const User = mongoose.model('User',UserSchema)

module.exports = User