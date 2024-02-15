const bcrypt = require("bcryptjs")
const { adminRepository } = require("../../repository/admin")

module.exports.createAdmin = async(req, res) => {
    try {
        const { name, login, password, role, open_page } = req.result
        
        const find = await adminRepository().findOne({ login: login })
        if (find) res.status(400).json({ status: 400, error: 'User login already exists', data: null });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newObj = { name, login, role, open_page, password: hash }

        await adminRepository().insert(newObj)
        res.status(200).json({ status: 200, error: null, data: "Successful saved" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 500, error: err.message, data: null });
    }
}

module.exports.listActive = async(req, res) => {
    try {
        const { active } = req.query
        const adminList = await adminRepository().findAll()
        if(active === 'inactive') {
            res.status(200).json({ status: 200, error: null, data: adminList.filter(e => !e.active)})
        } else {
            res.status(200).json({ status: 200, error: null, data: adminList.filter(e => e.active)})
        }
    } catch (err) {
        res.status(500).json({ status: 500, error: err.message, data: null })
    }
}

module.exports.updateAdmin = async(req, res) => {
    try {
        const { id } = req.params
        const args = req.result
        const findId = await adminRepository().findById(id)
        if (!findId) res.status(404).json({ status: 404, error: "Admin Not Found", data: null })

        const findLogin = await adminRepository().findOne({ login: args.login })
        if (findLogin && findLogin._id != id) res.status(400).json({ status: 400, error: 'User login already use', data: null });

        let password
        if (args.password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(args.password, salt);
        }
        await adminRepository().update(id, {
            name: args.name || findId.name,
            login: args.login || findId.login,
            password: password || findId.password,
            role: args.role || findId.role,
            open_page: args.open_page || findId.open_page
        })
        res.status(200).json({ status: 200, error: null, data: 'Successful updated' })
    } catch (err) {
        res.status(500).json({ status: 500, error: err.message, data: null })
    }
}

module.exports.deleteAdmin = async(req, res) => {
    try {
        const { id } = req.params

        await adminRepository().remove(id)
        res.status(204).json({ status: 204, error: null, data: 'Successful deleted' })
    } catch (err) {
        res.status(500).json({ status: 500, error: err.message, data: null })
    }
}

module.exports.activeAdmin = async(req, res) => {
    try {
        const { id } = req.params
        
        await adminRepository().active(id)
        res.status(204).json({ status: 200, error: null, data: 'Successful activate' })
    } catch (err) {
        res.status(500).json({ status: 500, error: err.message, data: null })
    }
}
