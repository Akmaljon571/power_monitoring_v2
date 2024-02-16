const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

module.exports.getLastInsertedJournal = async(req, res) => {
    try{
        const lastInsertedDocument = await repositories().journalRepository().findLastInserted(req.params)

        res.status(200).json({ status: 200, error: null, data: lastInsertedDocument })
    } catch(err){
        const error = new CustomError(err.status, err.message)
        res.status(error.status).json({ status: error.status, error: error.message, data: null })
    }
}

module.exports.getLastSuccessfullyInsertedJournal = () => {
    return async (event,args) =>{
        try{
             const lastInsertedDocument = await repositories().journalRepository().findLastSuccesfullyInserted({meter_id:args.meter_id})
             return { status: 200, result: JSON.stringify(lastInsertedDocument) }
  
       }catch(err){
        return new CustomError(err.status, err.message)
        }
    }
}

module.exports.getJournalList = () => {
    return async (event,args) =>{
        try{
             const documentsOfJournal = await repositories().journalRepository().findAll({meter_id:args.meter_id})
             return { status: 200, result: JSON.stringify(documentsOfJournal) }

       }catch(err){
        return new CustomError(err.status, err.message)
        }
    }
}


