const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Product Name'],
        trim: true, //remove blanck spaces
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please Enter Product Price'],
        default: 0.0,
        maxLength: [10, 'Product price cannot exceed 10 characters']
    },
    description: {
        type: String,
        required: [true, 'Please Enter Product Description'],
    },
    material: {
        type: String
    },
    dimensions: {
        type: String
    },
    color: {
        type:String
    },
    warrenty: {
        type: String
    },
    storage: {
        type: String
    }
    ,
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select a category for this product'],
        enum: {
            values: ['Bookcases and shelves', 'Dining Tables', 'Shoes Racks', 'Sofas', 'Chairs', 'Single Beds', 'Double Beds', 'Study Tables', 'TV and Media Units', 'Kitchen and Decor', 'Dining Sets', 'Wardrobes', 'Outdoors'],
            message: 'Please select correct category for this product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller name']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        // maxLength:[5,'Please']
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date
    }

})



module.exports = mongoose.model('Product', productSchema)