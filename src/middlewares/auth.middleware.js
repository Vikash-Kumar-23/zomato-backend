const foodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

function getToken(req) {
    const header = req.headers && req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.substring('Bearer '.length);
    }
    return req.cookies && req.cookies.token;
}

async function authFoodPartnerMiddleware(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decoded.id);
        if (!foodPartner) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

async function authUserMiddleware(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware
};
