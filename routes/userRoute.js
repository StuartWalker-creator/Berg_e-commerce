const express = require('express')
const userRouter = express.Router()

const {createUser,login,fetchSingleUser,fetchUsers,getSearchHistory,verifyToken} = require('../controllers/user-controller.js')

const jwt_auth = require('../middleware/jwt-auth.js')

userRouter.post('/create',createUser)
userRouter.post('/login',login)
userRouter.get('/getme',jwt_auth,fetchSingleUser)
userRouter.get('/get-searchHistory',jwt_auth,getSearchHistory)
userRouter.post('/verify-token',verifyToken)

module.exports = userRouter