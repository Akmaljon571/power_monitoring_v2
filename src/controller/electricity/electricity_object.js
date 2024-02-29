const CustomError = require("../../utils/custom_error")
const { repositories } = require("../../repository")
const { type_enum } = require("../../validation/elect_object")
const { formatParamsList } = require("../../global/file-path")

module.exports.getElectricityObjects = async (req, res) => {
   try {
      const objectDocuments = await repositories().electObjectRepository().findAll({ type: "factory" })

      res.status(200).json({ status: 200, error: null, data: objectDocuments })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.getSingleElectricityObject = async (req, res) => {
   try {
      const { id } = req.params
      const objectDocument = await repositories().electObjectRepository().findOne(id, req.data)
      if (!Object.keys(objectDocument).length) {
         return res.status(200).json({ status: 200, error: null, data: {} })
      }

      const allData = objectDocument.parameters.map(e => e.param_details[0] || '')
      const formatParams = formatParamsList()
      const map = allData.map(e => e && e.channel_full_id.split('.').slice(0, 2).join('.')).filter(e => e)
      const block = formatParams.indicators_block.filter(e => map.length && (map.includes(e.channel_full_id) || e.channel_full_id == '4.8'))
      objectDocument.block = block

      res.status(200).json({ status: 200, error: null, data: objectDocument })
   } catch (err) {
      console.log(err)
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.listUseMeterElectFn = async (req, res) => {
   try {
      const data = await repositories().electObjectRepository().listUse()

      res.status(200).json({ status: 200, error: null, data })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.insertPapka = async (req, res) => {
   try {
      const args = req.result

      if (args.parent_object) {
         const parentObject = await repositories().electObjectRepository().findById(args.parent_object)
         if (!parentObject) {
            return new CustomError(404, 'Parent Not Found')
         }

         const obj = {
            substation: [0, 1],
            tire_section: [0, 1, 2],
            feeder: [0, 1, 2],
         }

         const index = type_enum.findIndex((e) => e === parentObject.type)
         if (!obj[args.type] || !obj[args.type].includes(index)) {
            return new CustomError(400, 'Parent Bad Request')
         }
      }

      await repositories().electObjectRepository().insert(args)
      res.status(201).json({ status: 201, error: null, data: "Successful Created" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.insertMeter = async (req, res) => {
   try {
      const args = req.result

      const parentObject = await repositories().electObjectRepository().findById(args.parent_object)
      if (!parentObject || parentObject.type != "feeder")
         return new CustomError(404, 'Parent Not Found Or Parent type != feeder')
      if (await repositories().electObjectRepository().findParentMeter(args.parent_object))
         return new CustomError(400, 'Parent Feeder already use meter')
      if (await repositories().electObjectRepository().findMeter(args.meter_id))
         return new CustomError(400, 'Meter already use')

      const paramerts_list = await repositories().parameterRepository().findMeter({ meter: args.meter_id })
      const parameters = []

      paramerts_list.map(e => {
         if (e.status == 'active' || e.parameter_type === 'archive') {
            parameters.push({
               parameter_id: e._id,
               sign: true,
               multiply: args.multiply
            })
         }
      })

      await repositories().electObjectRepository().insertParentParams(parentObject._id, parameters)
      const newObj = {
         name: args.name,
         type: args.type,
         parent_object: args.parent_object,
         meter_id: args.meter_id,
         vt: args.vt,
         ct: args.ct,
         parameters
      }
      await repositories().electObjectRepository().insert(newObj)
      res.status(201).json({ status: 201, error: null, data: "Successful Created" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.updateFolderFn = async (req, res) => {
   try {
      const { id } = req.params
      await repositories().electObjectRepository().update(id, req.result)

      res.status(200).json({ status: 200, error: null, data: "Successful updated" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.updateMeterFn = async (req, res) => {
   try {
      const { id } = req.params
      const args = req.result

      const findOne = await repositories().electObjectRepository().findById(id)
      const obj = {
         name: args.name || findOne.name,
         vt: args.vt || findOne.vt,
         ct: args.ct || findOne.ct,
      }
      if (!findOne || findOne.type != 'meter') return { status: 404, message: "Meter Not Found" }

      if (args.multiply) {
         obj.parameters = findOne.parameters.map(e => ({
            multiply: args.multiply,
            sign: e.sign,
            parameter_id: e.parameter_id
         }))
      }
      await repositories().electObjectRepository().update(id, obj)

      res.status(200).json({ status: 200, error: null, data: "Successful updated" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.attachParamsElectFN = async (req, res) => {
   try {
      const { id } = req.params
      const { parameters } = req.result

      await repositories().electObjectRepository().update(id, { parameters })
      res.status(200).json({ status: 200, error: null, data: "Successful updated" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}

module.exports.deleteElect = async (req, res) => {
   try {
      await repositories().electObjectRepository().remove(req.params.id)
      res.status(204).json({ status: 204, error: null, data: "Successful deleted" })
   } catch (err) {
      const error = new CustomError(err.status, err.message)
      res.status(error.status).json({ status: error.status, error: error.message, data: null })
   }
}
