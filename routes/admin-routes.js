const express = require('express')
const router = express.Router()

const jwt_auth = require('../middleware/jwt-auth.js')
const authorize = require('../middleware/authorize.js')
const upload = multer({ dest: 'temp/' });

const {createProduct} = require('../controllers/adminController.js')

router.post('/products',jwt_auth,authorize('owner','admin'),upload.any(),createProduct)

module.exports = router