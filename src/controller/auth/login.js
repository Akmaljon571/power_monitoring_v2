const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { repositories } = require("../../repository");
const { v4 } = require("../../utils/uuid");
const { sessionCreate } = require("../../utils/session");
const CustomError = require("../../utils/custom_error");

module.exports.authorization = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!(username && password))
            return res.status(401).json({ status: 401, error: "Username and password is required"})
        
        const user = await repositories().adminRepository().findOne({ login: username });
        if (user) {
            if (user.active) {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    res.status(401).json({ status: 401, error: "Username or password is wrong", data: null});
                } else {
                    await repositories().adminRepository().update(user._id, {last_active: new Date()})
                    const tokens = await authCheck(user)

                    res.cookie('access_token', tokens.access);
                    res.status(200).json({ status: 200, data: {refresh_token: tokens.refresh, session: tokens.session}, error: null })
                }
            } else {
                res.status(401).json({ status: 401, error: "User No Active", data: null})
            } 
        } else {
            res.status(401).json({ status: 401, error: "user is not exist with this id", data: null });
        }
    } catch (err) {
        console.log(err)
        res.status(401).json({ status: 401, error: err.message, data: null });
    }
}

const authCheck = async(user) => {
    try {
        await repositories().authRepository().remove({ admin_id: user._id })

        const newObj = {
            access_token: v4(),
            refresh_token: v4(),
            a_t_created_date: new Date(),
            session_created_date: new Date(),
            admin_id: user._id
        }
        const a = await repositories().authRepository().insert(newObj)

        const session =  sessionCreate(String(a._id), process.env.SECRET_KEY)
        const refresh = jwt.sign({ user: user._id }, newObj.refresh_token, { expiresIn: '30d' });
        const access = jwt.sign({ user: user._id }, newObj.access_token, { expiresIn: '1m' });
        
        return { refresh, access, session }
    } catch (err) {
        console.log(err)
        throw new CustomError(err.status, err.message)
    }
}
