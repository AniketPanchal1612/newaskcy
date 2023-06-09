const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please enter your name'],
        maxLength:[30,'Your name cannot exceed 30 characters']
    },
    email:{
        type: String,
        required :[true,'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail,'Please enter a valid email address']
    },
    password:{
        type:String,
        required: [true,'Please enter your password'],
        minLength:[6,'Your password must be at least 6 characters'],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    role:{
        type:String,
        default:'user'
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date    


});


//Encypting
userSchema.pre('save',async function (next){
    //check if pass modify or not if modify then encrypt
    if(!this.isModified('password')){ //if email id modify but pass not modity then not encypt again
        next();
    }

    this.password = await bcrypt.hash(this.password,10);
 })



//JWT
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

//compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    
    return await bcrypt.compare(enteredPassword,this.password);
}


//password reset token
userSchema.methods.getResetPasswordToken = function(){
    //Generate a Token
    const resetToken = crypto.randomBytes(20).toString('hex')
    console.log(resetToken)
    //hash and set to resetPasswordToken
    //hash token only for database
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log(this.resetPasswordToken)
    //set token expire time
    this.resetPasswordExpire = Date.now() + 30*60*1000 

    //without hash
    return resetToken


}


module.exports = mongoose.model('User',userSchema);