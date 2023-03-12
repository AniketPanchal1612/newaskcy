const express = require('express')
const router = express.Router()
const {deleteProduct,getProducts,newProduct,getSingleProduct,updateProduct, createProductReview, getProductReviews, deleteReview, getTrendingProducts, getBestProducts, getAdminProducts} = require('../controller/productController.js')
const { isAuthenticatedUser, authoriseRoles } = require('../middlewares/Auth.js')



router.route('/products').get(getProducts) 
router.route('/admin/products').get(getAdminProducts)  
router.route('/product/:id').get(getSingleProduct) 


router.route('/admin/product/:id').put(isAuthenticatedUser,authoriseRoles('admin'),updateProduct)
router.route('/admin/product/:id').delete(isAuthenticatedUser,authoriseRoles('admin'),deleteProduct)
router.route('/admin/product/new').post(isAuthenticatedUser,authoriseRoles('admin'),newProduct)



router.route('/review').put(isAuthenticatedUser,createProductReview);
router.route('/review').get(isAuthenticatedUser,getProductReviews);
router.route('/review').delete(isAuthenticatedUser,deleteReview);


module.exports = router;


