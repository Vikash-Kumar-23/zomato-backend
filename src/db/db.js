const mongoose = require('mongoose');
const favoriteModel = require('../models/favorite.model');

//connect to database(mongodb)
function connectDB() {
    mongoose.connect(process.env.MONGODB_URI)
        .then(async () => {
            // Replace the old sparse favorite indexes with partial indexes so
            // users can save multiple foods and multiple restaurants.
            await favoriteModel.syncIndexes();
            console.log('Database connected');
        })
        .catch(err => console.log(err));
}

module.exports = connectDB;
