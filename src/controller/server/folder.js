const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

// getFoldersList
module.exports.getListFolders = async(req, res) => {
    try {
        const query = req.query
        console.log(query)
        const folderDocuments = await repositories().folderObjectRepository().findAll(query)

        res.status(200).json({ status: 200, error: null, data: folderDocuments })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getSingleFolder = async(req, res) => {
    try {
        const { id } = req.params
        const folderDocument = await repositories().folderObjectRepository().findOne(id)

        if (!folderDocument) { return res.status(404).json({ status: 404, error: "Folder not found", data: null }) }
        res.status(200).json({ status: 200, error: null, data: folderDocument })
    } catch (err) {
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.insertFolderRequest = () => {
    return async (event, args) => {
        try {
            console.log(args)
            let parameters = { name: args.name, folder_type: "folder", parent_id: args.parent_id ? args.parent_id : null }
            let folderDocument = await repositories().folderObjectRepository().insert(parameters)
            return { status: 200, result: JSON.stringify(folderDocument) }
        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}

module.exports.putEditFolderRequest = () => {
    return async (event, args) => {
        try {

        } catch (err) {
            return new CustomError(err.status, err.message)
        }
    }
}