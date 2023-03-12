const ProductModel = require('../models/ProductModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary');

// Create a new Product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    
    // let images =[]
    // if(typeof req.body.images ==='string'){
    //     images.push(req.body.images)
    // }else{
    //     images = req.body.images
    // }

    // let imagesLinks = [];

    // for(let i=0 ; i < images.length ; i++){
    //     const result = await cloudinary.v2.uploader.upload(images[i],{
    //         folder:'products'
    //     })

    //     imagesLinks.push({
    //         public_id: result.public_id,
    //         url: result.secure_url
    //     })
    // }
    // req.body.images = imagesLinks
    // req.body.user = req.user.id;
    // // console.log("objectdd")
    
    try {
        
        const product = await ProductModel.create(req.body)
        // const product = new ProductModel(res.body);
        // await product.save();
        res.status(201).json({ success: true, product })
        console.log("object")
    } catch (error) {

        console.log(error)
        res.status(500).json(error)
    }
})

//Get all products => /api/v1/products
exports.getProducts = async (req, res, next) => {

    console.log("object")
    const resPerPage = 8
    const productsCount = await ProductModel.countDocuments() // total num of products
    const apiFeatures = new APIFeatures(ProductModel.find(), req.query).search().filter().pagination(resPerPage)

    const products = await apiFeatures.query

    // console.log(products)

    // console.log(products)
    // setTimeout(()=>{
        res.status(200).json({
        success: true,
        productsCount,
        products,
        resPerPage
    })
    // },500);
}

//get admin products   /api/v1/admin/products
exports.getAdminProducts =catchAsyncErrors( async (req, res, next) => {

    const products = await ProductModel.find();

    res.status(200).json({
        products
    })

})
//Get Single Product => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
    console.log("object2")

    const product = await ProductModel.findById(req.params.id);

    if (!product) {
        // return res.status(404).json({
        //     success: false,
        //     message: "Product not found"
        // })
        return next(new ErrorHandler('Product not found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})

//Update product => /api/v1/product/:id

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await ProductModel.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'ask_products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        req.body.images = imagesLinks
    }
    

    product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
}
)

//Delete a Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }
    for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.remove();

    res.status(200).json({ success: true, message: "Product deleted successfully" })
}
)



//create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await ProductModel.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment,
                    review.rating = rating
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }


    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,

    })
})


//get product Reviews => /api/v1/reviews

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await ProductModel.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })

})


exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await ProductModel.findById(req.query.productId)
    console.log(product)

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length;

    const ratings = product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await ProductModel.findByIdAndUpdate(req.query.productId, {
        reviews, ratings, numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})