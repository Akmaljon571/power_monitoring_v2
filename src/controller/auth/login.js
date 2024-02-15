const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { repositories } = require("../../repository")

module.exports.authorization = async (req, res) => {
    try {
        const { username, password } = req.body;
        const TOKEN_KEY = process.env.TOKEN_KEY

        if (!(username && password)) {
            return res.status(401).json({ status: 401, error: "Username and password is required"})
        }
        const user = await repositories().adminRepository().findOne({ login: username });
        if (user) {
            if (user.active) {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    res.status(401).json({ status: 401, error: "Username or password is wrong", data: null});
                } else {
                    await repositories().adminRepository().update(user._id, {last_active: new Date()})
                    const token = jwt.sign(
                        { user: user._id, role: user.role },
                        TOKEN_KEY,
                        {
                            expiresIn: "10h",
                        }
                    );
                    const ok = JSON.stringify(user)
                    res.status(200).json({ status: 200, data: { token, user: JSON.parse(ok) }, error: null })
                }
            } else {
                res.status(401).json({ status: 401, error: "User No Active", data: null})
            } 
        } else {
            res.status(401).json({ status: 401, error: "user is not exist with this id", data: null });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ status: 401, error: err.message, data: null });
    }
}
