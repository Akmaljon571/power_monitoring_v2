const CustomError = require("../../helpers/customError")
const { repositories } = require("../../db_mongodb/repository/index")
const { type_enum, createElectFolder, createElectMeter, updateElectFolder, updateElectMeter, attachParamsElectJoi } = require("../../validators/elect_object")

module.exports.getElectricityObjects = () => {
   return async (event, args) => {
      try {
         const objectDocuments = await repositories().electObjectRepository().findAll({type:"factory"})
      
         return { status: 200, args: JSON.stringify(objectDocuments) }
      } catch (err) {
         return new CustomError(err.status, err.message)
      }
   }
}

module.exports.getSingleElectricityObject = () => {
   return async (event, args) => {
      try {
           const idDocument = args.id
           const objectDocument = await repositories().electObjectRepository().findOne(idDocument,args)
           return { status: 200, args: JSON.stringify(objectDocument) }
      } catch (err) {
         return new CustomError(err.status, err.message)
      }
   }
}

module.exports.insertPapka = () => {
   return async(event, args) => {
      try {
         await createElectFolder(args)
         if(args.parent_object) {
            const parentObject = await repositories().electObjectRepository().findById(args.parent_object)
            if (!parentObject) {
               return new CustomError(404, 'Parent Not Found')
            }

            const obj = {
               substation: [0, 1], 
               tire_section: [0, 1, 2],
               feeder: [0,1,2],
            }

            const index =  type_enum.findIndex((e) => e === parentObject.type)
            if (!obj[args.type] || !obj[args.type].includes(index)) {
               return new CustomError(400, 'Parent Bad Request')
            }
         }

         await repositories().electObjectRepository().insert(args)
         return {status: 200, message: "Created"}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.insertMeter = () => {
   return async(event, args) => {
      try {
         await createElectMeter(args)
         const parentObject = await repositories().electObjectRepository().findById(args.parent_object) 
         if (!parentObject || parentObject.type != "feeder") {
            return new CustomError(404, 'Parent Not Found Or Parent type != feeder')
         }
         if(await repositories().electObjectRepository().findParentMeter(args.parent_object) ) {
            return new CustomError(400, 'Parent Feeder already use meter')
         }
         if(await repositories().electObjectRepository().findMeter(args.meter_id)) {
            return new CustomError(400, 'Meter already use')
         }
         const paramerts_list = await repositories().parameterRepository().findMeter({ meter: args.meter_id })
         const parameters = []

         paramerts_list.map(e => {
            console.log(e)
               if(e.status == 'active' || e.parameter_type === 'archive') {
                  parameters.push({
                     parameter_id: e._id,
                     sign: true,
                     multiply: args.multiply
                 })
               }
            }
         )
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
         return {status: 201, message: 'Created'}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.deleteElect = () => {
   return async(event, args) => {
      try {
         await repositories().electObjectRepository().remove(args.id)
         return {status: 204}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.listUseMeterElectFn = () =>{
   return async(event, args) => {
      try {
         const data = await repositories().electObjectRepository().listUse()
         return {status: 200, data}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.updateFolderFn = () => {
   return async (event, args) => {
      try {
         await updateElectFolder(args)
         await repositories().electObjectRepository().update(args.id, {name: args.name})
         return {status: 200, message: "Updated"}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.updateMeterFn = () => {
   return async (event, args) => {
      try {
         await updateElectMeter(args)
         const findOne = await repositories().electObjectRepository().findById(args.id)
         const obj = {
            name: args.name || findOne.name,
            vt: args.vt || findOne.vt,
            ct: args.ct || findOne.ct,
         }
         if(!findOne || findOne.type != 'meter') return {status: 404, message: "Meter Not Found"}
         
         if(args.multiply) {
            obj.parameters = findOne.parameters.map(e => ({
               multiply: args.multiply,
               sign: e.sign,
               parameter_id: e.parameter_id
            }))
         }
         await repositories().electObjectRepository().update(args.id, obj)
         return {status: 200, message: "Updated"}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}

module.exports.attachParamsElectFN = () => {
   return async (event, args) => {
      try {
         await attachParamsElectJoi(args)
         
         await repositories().electObjectRepository().update(args.id, {parameters: args.parameters})
         return {status: 200, message: "Updated"}
      } catch (error) {
         return new CustomError(error.status, error.message)
      }
   }
}
