const express = require('express')
const router = express.Router()

const {registerUser,loginUser, logoutUser,forgotPassword, resetPassword, getUserProfile, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUser, deleteUser} = require('../controller/authController')
const { isAuthenticatedUser, authoriseRoles } = require('../middlewares/Auth.js')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/me').get(isAuthenticatedUser,getUserProfile)
router.route('/password/update').put(isAuthenticatedUser,updatePassword )
router.route('/me/update').put(isAuthenticatedUser,updateProfile)

router.route('/admin/users').get(isAuthenticatedUser,authoriseRoles('admin'),getAllUsers)
router.route('/admin/user/:id').get(isAuthenticatedUser,authoriseRoles('admin'),getSingleUser)
router.route('/admin/user/:id').put(isAuthenticatedUser,authoriseRoles('admin'),updateUser)
router.route('/admin/user/:id').delete(isAuthenticatedUser,authoriseRoles('admin'),deleteUser)

module.exports = router