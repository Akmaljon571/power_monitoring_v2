const jwt = require('jsonwebtoken');
const { sessionParse } = require('../utils/session');
const { repositories } = require('../repository');
const CustomError = require('../utils/custom_error');

module.exports.adminToken = async(req, res, next) => {
    try {
        const access_token = req.cookies?.access_token;
        if (!access_token) return res.status(401).json({ status: 401, error: 'Unauthorized' });

        const { session } = req.headers
        if (!session) return res.status(405).json({ status: 405, error: 'Unauthorized' });

        const id = sessionParse(session, process.env.SECRET_KEY)
        const sessionData = await repositories().authRepository().findOne({ _id: id })
        if(!sessionData) return res.status(405).json({ status: 405, error: 'Unauthorized' });

        jwt.verify(access_token, sessionData.access_token, async(err, value) => {
            if (err) return res.status(406).json({ status: 406, error: 'Not Acceptable' });

            const find = await repositories().adminRepository().findById(value.user)
            if(!find) return res.status(406).json({ status: 406, error: 'Not Acceptable' });
            
            if (find.role === 'admin' || find.role === 'super' ) next() 
            else return res.status(406).json({ status: 406, error: 'Not Acceptable' });
        });
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
};
