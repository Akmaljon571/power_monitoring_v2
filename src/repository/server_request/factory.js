const {models} = require("../../models/index")
const CustomError = require("../../utils/custom_error")

module.exports.factoryObjectRepository = () =>{
    return Object.freeze({
        insert,
        findAll,
        findOne,
        countDocuments
    })

    async function countDocuments(args){
        try {
            return await models().factoryModel.countDocuments(args)
        } catch (err) {
            throw new CustomError(500, err.message)
        }
    }

    async function insert(args){
        try{
          const factoryDocuments = await models().factoryModel.insertMany(args)
          return factoryDocuments
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findAll(query){
        try{
            const pipArray = [
                {
                    $lookup:{
                        from:"meters",
                        foreignField:"factory",
                        localField:"_id",
                        pipeline:[
                             {
                                $lookup:{
                                    from:"parameters",
                                    foreignField:"meter",
                                    localField:"_id",
                                    as:"parameters"
                                }
                             }
                        ],
                        as:"meters",
                    }
                }
            ]
            const  factoryDocuments = await models().factoryModel.aggregate(pipArray)
            return [...factoryDocuments]
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findOne(id,query){
         const pipArray = [
            {
                $match:{ _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup:{
                    from:"meters",
                    foreignField:"factory",
                    localField:"_id",
                    pipeline:[
                         {
                            $lookup:{
                                from:"parameters",
                                foreignField:"meter",
                                localField:"_id",
                                as:"parameters"
                            }
                         }
                    ],
                    as:"meters",        
                }
            }
        ]

        const factoryDocument = await models().factoryModel.aggregate(pipArray)
        return factoryDocument[0]
    }
}

