const User = require('../models/User');

const auth = async (req, res, next) => {
    if (!req.query.id) return res.status(403).json({ message: 'Invalid id' });
    const user = await User.findById(req.query.id);
    if (!user) return res.status(403).json({ message: 'User not found' });
    req.user = user;
    next();
}

module.exports = {
    auth
};