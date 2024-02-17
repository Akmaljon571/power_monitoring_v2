const jwt = require('jsonwebtoken')

module.exports.adminToken_superToken = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ status: 401, error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, value) => {
        if (err) {
            return res.status(403).json({ status: 403, error: 'Forbidden' });
        }

        if (value.role === 'admin' || value.role === 'super' ) {
            next();
        } else {
            return res.status(403).json({ status: 403, error: 'Forbidden' });
        }
    });
};
