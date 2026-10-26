const mongoose = require('mongoose');
//fullName,email,password
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    }
},{
    timestamps: true
});
//create user model
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
