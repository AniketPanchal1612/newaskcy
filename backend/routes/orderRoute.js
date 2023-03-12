const express = require('express')
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controller/orderController')
const { isAuthenticatedUser, authoriseRoles } = require('../middlewares/Auth')
const router = express.Router()


router.route('/order/new').post(isAuthenticatedUser,newOrder)
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder)
router.route('/orders/me').get(isAuthenticatedUser,myOrders)


router.route('/admin/orders').get(isAuthenticatedUser,authoriseRoles('admin'),getAllOrders)
router.route('/admin/order/:id').put(isAuthenticatedUser,authoriseRoles('admin'),updateOrder)
router.route('/admin/order/:id').delete(isAuthenticatedUser,authoriseRoles('admin'),deleteOrder)

module.exports = router;