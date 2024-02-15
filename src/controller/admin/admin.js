const bcrypt = require("bcryptjs")
const { adminRepository } = require("../../repository/admin")

module.exports.createAdmin = async(req, res) => {
    try {
        const { name, login, password, role, open_page } = req.result
        
        const find = await adminRepository().findOne({ login: login })
        if (find) return res.status(400).json({ status: 400, error: 'User login already exists', data: null });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newObj = { name, login, role, open_page, password: hash }

        await adminRepository().insert(newObj)
        return res.status(200).json({ status: 200, error: null, data: "Successful saved" });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 500, error: err.message, data: null });
    }
}

module.exports.listActive = async(req, res) => {
    try {
        const { active } = req.query
        console.log(active)
        const adminList = await adminRepository().findAll()
        if(active === 'inactive') {
            res.status(200).json({ status: 200, error: null, data: adminList.filter(e => !e.active)})
        } else {
            res.status(200).json({ status: 200, error: null, data: adminList.filter(e => e.active)})
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 500, error: err.message, data: null })
    }
}

module.exports.updateAdminFn = (db) => {
    return async (event, args) => {
        try {
            await validatorUpdateAdmin(args)
            if (!tokenCheck(args.token)) return { status: 401, error: 'Token invalid Or not Admin', result: null }

            const { id } = args
            const findId = await adminRepository().findById(id)
            if (!findId) return { status: 404, error: "Admin Not Found", result: null }

            const findLogin = await adminRepository().findOne({ login: args.login })
            if (findLogin && findLogin._id != id) return { status: 401, error: 'User login already use', result: null };

            let password
            if (args.password) {
                const salt = await bcrypt.genSalt(10);
                password = await bcrypt.hash(args.password, salt);
            }

            await adminRepository().update(args.id, {
                name: args.name || findId.name,
                login: args.login || findId.login,
                password: password || findId.password,
                role: args.role || findId.role,
                open_page: args.open_page || findId.open_page
            })
            return { status: 200, error: null, result: 'Successful updated' }
        } catch (err) {
            console.log(err)
            return { status: 500, error: err.message, result: null }
        }
    }
}

module.exports.deleteAdminFn = () => {
    return async (event, args) => {
        try {
            await validateDeleteAdmin(args)
            if (!tokenCheck(args.token)) return { status: 401, error: 'Token invalid Or not Admin', result: null }

            await adminRepository().remove(args.id)
            return { status: 204, error: null, result: 'Successful deleted' }
        } catch (err) {
            console.log(err)
            return { status: 500, error: err.message, result: null }
        }
    }
}

module.exports.activeAdminFn = () => {
    return async (event, args) =>{
        try {
            await validateDeleteAdmin(args)
            if (!tokenCheck(args.token)) return { status: 401, error: 'Token invalid Or not Admin', result: null }

            await adminRepository().active(args.id)
            return { status: 200, error: null, result: 'Successful active' }
        } catch (error) {
            console.log(error)
            return {status: 500, error: null, result: null}
        }
    }
}