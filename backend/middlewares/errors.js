const ErrorHandler = require('../utils/errorHandler')

//errorhandler property statuscode and message
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    // err.message = err.message || 'Internal Server Error';

    if(process.env.NODE_ENV ==='DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error:err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV ==='PRODUCTION'){
        let error = {...err}
        error.message = err.message

        //Wrong mongoose object ID error
        if(err.name==='CastError'){
            const message = `Resource not found: ${err.path}`
            error = new ErrorHandler(message,400)
        }

        //Handle Mongoose validation error
        if(err.name==='ValidationError'){
            const message = Object.values(err.errors).map(value =>value.message);
            error = new ErrorHandler(message,400)
        }

        
        res.status(error.statusCode||500).json({
            success:false,
            message:error.message || 'Internal Server Error'
        })
    }

}