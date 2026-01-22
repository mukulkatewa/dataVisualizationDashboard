const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'blackcoffer-dashboard-secret-key-2024';

// Verify JWT token middleware
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Optional auth - doesn't block if no token
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            req.user = jwt.verify(token, JWT_SECRET);
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
