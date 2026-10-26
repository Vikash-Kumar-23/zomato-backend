const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        min: 0,
    },
    isVeg: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        trim: true,
    },
    portionSize: {
        type: String,
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isBestseller: {
        type: Boolean,
        default: false,
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodPartner',
    }
}, { timestamps: true });

const foodModel = mongoose.model('food', foodSchema);

module.exports = foodModel;
