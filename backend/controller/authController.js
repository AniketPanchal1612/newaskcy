const UserModel = require('../models/UserModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const cloudinary = require('cloudinary');
//register a user ==> api/v2/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    
    const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: 'ask_avatars',
        width: 150,
        crop:"scale"
    })
    
    const { name, email, password } = req.body;
    const user = await UserModel.create({
        name, email, password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    });
    console.log(user)
    // const token = user.getJwtToken();
    sendToken(user, 200, res);

    res.status(201).json({
        success: true,
        // user
        token
    })
})


exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Pleas enter email or password', 401));
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res);

})

//reset password ==>/api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await UserModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user)

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid', 401));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 401));
    }

    //setup new pass
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);


})

//forgot password =>/api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await UserModel.findOne({ email: req.body.email })

    console.log(user)
    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 404))
    }
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it`

    try {
        await sendEmail({
            email: user.email,
            subject: 'ASK Furniture Password Recovery',
            message
        })

        res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully` });



    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }

})
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
})


//get currently logged in user  ==> /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    // console.log(user)
    res.status(200).json({
        success: true,
        user
    })
})

//update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{


    const newUserData ={
        name: req.body.name,
        email: req.body.email,
    }
    if (req.body.avatar !== '') {
        const user = await UserModel.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'ask_avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    } 

    const user = await UserModel.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({success:true})
})

//update change password ==> /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await UserModel.findById(req.user.id).select('+password')

    const isMatch = await user.comparePassword(req.body.oldPassword)
    if(!isMatch) {
        // return res.status(400).json({message:"Your Old password is incorrect"})

        return next(new ErrorHandler('Old passowrd is incorrect',400));

    }
    user.password = req.body.password;
    await user.save();

    sendToken(user,200,res);
})


//Admin Routes

//get all users ==> /api/v1/admin/users

exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await UserModel.find();
    const userCount = await UserModel.countDocuments();
    res.status(200).json({
        success:true,
        userCount,
        // count:users.length,
        users
    })
})

//get single user => /api/v1/admin/user/:id
exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await UserModel.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not found with id. ${req.params.id}`,404))
    }

    res.status(200).json({
        success: true,
        user
    })
})


//update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async(req,res,next)=>{

    const newUserData ={
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({success:true})
})

//delete user => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await UserModel.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler('User not found',404));
    }
    const image_id = user.avatar.public_id;
     await cloudinary.v2.uploader.destroy(image_id); 

    await user.remove();

    res.status(200).json({success:true})
})