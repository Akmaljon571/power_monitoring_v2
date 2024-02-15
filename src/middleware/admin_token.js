const jwt = require('jsonwebtoken')

module.exports.adminToken = (req, res, next) => {
    const token = req.headers['token'];

    if (!token) {
        return res.status(401).json({ status: 401, error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, value) => {
        if (err) {
            return res.status(403).json({ status: 403, error: 'Forbidden' });
        }

        if (value.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ status: 403, error: 'Forbidden' });
        }
    });
};
