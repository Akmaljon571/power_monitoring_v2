const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

module.exports.createUspdServer = async(req, res) => {
    try {
        const uspdDocument = await repositories().uspdObjectRepository().insert(req.result)
        let folderParameter = { name: uspdDocument.name, folder_type: "uspd", parent_id: uspdDocument.parent_id, uspd: uspdDocument._id}
        
        await repositories().folderObjectRepository().insert(folderParameter)
        res.status(201).json({ status: 201, error: null, data: "Successful Created" })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.updateUspdServer = async(req, res) => {
    try{
        const { id } = req.params
        const data = req.result
        const find = await repositories().uspdObjectRepository().findById(id)

        const parameters = {
            name: data.name ? data.name : find.name, 
            port: data.port ? data.port : find.port, 
            ipAddress: data.ipAddress ? data.ipAddress : find.ipAddress,
            timeDifference: data.timeDifference ? data.timeDifference : find.timeDifference,
            login: data.login ? data.login : find.login,
            password: data.password ? data.password : find.password,
            connection_channel: data.connection_channel ? data.connection_channel : find.connection_channel
        }

        await repositories().uspdObjectRepository().updateOne({_id:id}, parameters)
        if(data.name) await repositories().folderObjectRepository().updateUSPD(id, { name: data.name })

        res.status(200).json({ status: 200, error: null, data: "Successful updated" })
    }catch(err){
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}