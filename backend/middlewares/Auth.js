const catchAsyncErrors = require('../middlewares/catchAsyncError')
const ErrorHandler = require('../utils/errorHandler')
const jwt= require('jsonwebtoken')
const UserModel = require('../models/UserModel')
//authenticate or not
exports.isAuthenticatedUser=catchAsyncErrors(async(req,res,next)=>{

    const {token} = req.cookies

    if(!token){
        return next(new ErrorHandler('Login first to access resources',401))
    }

    const decoded= jwt.verify(token,process.env.JWT_SECRET);
    
    req.user= await UserModel.findById(decoded.id);
    next()
})


exports.authoriseRoles = (...roles)=>{

    return  (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(

                new ErrorHandler(`Role ${req.user.role} is  not allowed`,403)
                ); 
        }
        next()
    }
}