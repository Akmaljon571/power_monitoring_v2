const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")

module.exports.getElectricityObjectsCalculation = async(req, res) => {
   try {
      const objectDocuments = await repositories().calculationObjectRepository().findAll({type:"main"})
      
      res.status(200).json({ status: 200, error: null, data: objectDocuments })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.getSingleElectricityObjectCalculation = async(req, res) => {
   try {
      const { id } = req.params
      
      const objectDocument = await repositories().calculationObjectRepository().findOne(id)
      res.status(200).json({ status: 200, error: null, data: objectDocument })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.insertPapkaCalculation = async(req, res) => {
   try {
      const args = req.result

      if(args.parent_object) {
         const parentObject = await repositories().calculationObjectRepository().findById(args.parent_object)
         if (!parentObject) return new CustomError(404, 'Parent Not Found')
         else if(args.type === 'main') return new CustomError(400, 'Main failed')
         else if (parentObject.type == 'meter') return new CustomError(400, 'Parent Bad Request')
      }

      await repositories().calculationObjectRepository().insert(args)
      res.status(201).json({ status: 201, error: null, data: "Successful Created" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.updateFolderCalculationFn = async(req, res) => {
   try {
      const { id } = req.params

      await repositories().calculationObjectRepository().update(id, req.result)
      res.status(200).json({ status: 200, error: null, data: "Successful Updated" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.attachParamsCalculationFN = async(req, res) => {
   try {
      const { id } = req.params
      const { parameters } = req.result

      await repositories().calculationObjectRepository().update(id, { parameters })
      res.status(200).json({ status: 200, error: null, data: "Successful Updated" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.deleteCalculation = async(req, res) => {
   try {
      const { id } = req.params
      await repositories().calculationObjectRepository().remove(id)
   
      res.status(204).json({ status: 204, error: null, data: "deleted" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}
