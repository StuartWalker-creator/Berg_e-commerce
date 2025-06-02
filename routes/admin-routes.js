const express = require('express')
const router = express.Router()

const {} = require('../controllers/adminController.js')
const jwt_auth = require('../middleware/jwt-auth.js')
const authorize = require('../middleware/authorize.js')

module.exports = router