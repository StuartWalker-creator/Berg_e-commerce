const express = require('express')
const multer = require('multer')
const router = express.Router()

const jwt_auth = require('../middleware/jwt-auth.js')
const authorize = require('../middleware/authorize.js')
const upload = multer({ dest: 'temp/' });

const {createProduct,updateProduct,deleteProduct,makeFeatured,getAllOrders,updateStatus,getAllUsers,promoteUser,deleteUser} = require('../controllers/adminController.js')

router.post('/products',jwt_auth,authorize('owner','admin'),upload.any(),createProduct)

router.put('/products/:id',jwt_auth,authorize('owner','admin'),upload.any(),updateProduct)

router.delete('/products/delete/:id',jwt_auth,authorize('owner','admin'),deleteProduct)

router.post('/products/featured/:id',jwt_auth,authorize('owner','admin'),makeFeatured)

router.get('/orders/get/:lastId',jwt_auth,authorize('owner','admin'),getAllOrders)

router.put('/orders/:id/status',jwt_auth,authorize('owner','admin'),updateStatus)

router.get('/users/get/:lastId',jwt_auth,authorize('owner','admin'),getAllUsers)

router.put('/users/:id/promote',jwt_auth,authorize('owner'),promoteUser)

router.delete('/users/:id/delete',jwt_auth,authorize('owner'),deleteUser)


module.exports = router