const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js')

const createUser = async (req,res,next)=>{
  console.log('handling user creation')
  try {
    console.log(req.body)
    const {name,email, password,address} = req.body
    console.log(name,address, password,email)
    
    if (!name || !address || ! password || !email) {
      res.status(400)
      return next(new Error('Missing Credentials, fill in all the fields as they are mandatory'))
    }
    
    const existingUser = await User.findOne({email})
    
    if (existingUser) {
      res.status(403)
      return next(new Error('Email already used by someone else'))
    }
    
    const hash = await bcrypt.hash(password,10)
    
    const user = await User.create({
      name,
      email,
      address,
      password:hash
    })
    
    console.log('user created Successfully',user)
    
    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d'})
    
    console.log('token',token)
    
    res.status(201).json({user:user,token:token})
  } catch (e) {
    console.log(e)
    throw e
  }
}

//login user to existing account 
const login = async (req,res,next)=>{
  try {
    const {password,email} = req.body
    if (!password || !email) {
      res.status(403)
      return next(new Error('Missing credentials! All fields are mandatory'))
    }
    const user = await User.findOne({email})
    
    if (!user) {
      res.status(401)
      return next(new Error('No user found for the email'+email))
    }
    
    let isMatch = bcrypt.compare(password,user.password)
    if (!isMatch) {
      res.status(403)
      return next(new Error('Wrong password! Try again'))
    }
    
    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d'})
    
    console.log('token',token)
    res.status(200).json({
      user,token
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

//fetch single user, authentication needed 
const fetchSingleUser = async (req,res,next) => {
  try {
    console.log(req.user)
    const user = await User.findById(req.user?.id)
    
    if (!user || user.length<1) {
      console.log('no user found')
      res.status(403)
      return next(new Error('User not found! Try logging in or creating an account'))
    }
    console.log(user)
    res.status(200).json({
      name:user.name,email:user.email,address:user.address,preferences:user.preferences
    }
    )
  } catch (e) {
    console.log(e)
    throw e
  }
}

//fetch user. by the admin only
const fetchUsers = async (req,res,next) => {
  try {
    const {lastId} = req.query
    const limit = 10
    
    let query = lastId?{_id:{$lt:lastId}} : {}
    
    const users = await User.find(query).sort({_id:-1}).limit(limit)
    
  res.status(200).json(users)
  } catch (e) {
    console.log(e)
    throw e
  }
}

const getSearchHistory = async (req,res,next) => {
  try{
    const user = await User.findById(req.user._id)

res.json(user.preferences.searchHistory || [])
  } catch (e) {
    console.log(e)
    throw e
  }
}

const verifyToken = async (req,res,next) => {
  console.log('verifying')
  try {
    let {role} = req.query
    const {token} = req.body
    
    if (!role) {
      res.status(400)
      return next(new Error('Please include your role'))
    }
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    
    console.log(decoded)
    
    const user = await User.findById(decoded.id)
        console.log(user)
console.log('role',role)
    if (role=='admin') {
    console.log('user role',user.role)
    if (user.role!='admin' && user.role!='owner') {
      return res.status(401).json({
        valid:false
      })
    }
    }
    
    res.status(200).json({
      valid:true,user
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}
module.exports = {
  createUser,
  login,
  fetchSingleUser,
  fetchUsers,
  getSearchHistory,
  verifyToken
}