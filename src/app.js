//create server
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const cors = require('cors');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const offerRoutes = require('./routes/offer.routes');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/offers', offerRoutes);

// Serve uploaded files (videos) statically for development
// e.g. GET /uploads/videos/<filename>
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));



module.exports = app;
