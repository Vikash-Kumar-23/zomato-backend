const mongoose = require('mongoose');

const foodPartnerSchema = new mongoose.Schema({
    //B_name
    name: {
        type: String,
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    cuisines: [{
      type: String,
      trim: true,
    }],
    openingTime: {
      type: String,
      default: '09:00',
    },
    closingTime: {
      type: String,
      default: '22:00',
    },
    estimatedPrepTime: {
      type: Number,
      min: 0,
    },
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
    pickupAvailable: {
      type: Boolean,
      default: true,
    },
    costForTwo: {
      type: Number,
      min: 0,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    customerServicePhone: {
      type: String,
      default: '',
    },
    customerServiceEmail: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const foodPartnerModel = mongoose.model('foodPartner', foodPartnerSchema);

module.exports = foodPartnerModel;
