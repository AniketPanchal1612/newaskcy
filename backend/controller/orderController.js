const OrderModel = require('../models/OrderModel')
const ProductModel = require('../models/ProductModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const { response } = require('express')



//create new order => /api/v1/order/new

exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await OrderModel.create({
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user : req.user._id
    })

    res.status(200).json({
        success:true,
        order
    })
})


//get single order =>/api/v1/order/:id

exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await OrderModel.findById(req.params.id).populate('user','name email');

    if(!order){
        return next(new ErrorHandler('Order not found with this ID',404));
    }

    res.status(200).json({
        status:true,
        order
    })

})


//get orders of logged in user =>/api/v1/order/me

exports.myOrders = catchAsyncErrors(async(req,res,next)=>{

    const orders = await OrderModel.find({user: req.user.id})
    // console.log(orders)
    // if(!orders) {
    //     return next(new ErrorHandler('You dont have any orders',404));
    // }
    res.status(200).json({

        success:true,
        
        orders
    })
})


//admin get all orders =>/api/v1/admin/orders

exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await OrderModel.find();
    const orderCount = await OrderModel.countDocuments()

    let totalAmount = 0;
    orders.forEach(order=>{
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        status:true,
        orderCount,
        totalAmount,
        orders
    })
})

//update process order => /api/v1/admin/order/:id

//Update / Process order - ADMIN => api/v1/admin/order/:id
exports.updateOrder = async(req,res,next)=>{
    //find order by id
    const order = await OrderModel.findById(req.params.id)

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler('You have already delivered this product',404))
    }
    // get product and quantity
    order.orderItems.forEach(async item =>{
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
    order.delieveredAt = Date.now()

    await order.save();

    res.status(200).json({
        success:true,

    })
}
async function updateStock(id,quantity){
    // console.log(quantity)
    const product = await ProductModel.findById(id);
    
    // console.log(product.stock)
    product.stock = product.stock-quantity;
    await product.save({validateBeforeSave:false});
}


//Delete order ADMIN   =>/api/v1/admin/order/:id
exports.deleteOrder = async(req,res,next)=>{
    const order = OrderModel.findById(req.params.id)

    if(!order){
        return res.status(404).json({message:"No order found with this id"})
    }
    await order.remove();

    res.status(200).json({success:true,message:"Order deleted successfully"})
}
