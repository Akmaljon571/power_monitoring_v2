const { models } = require("../../models");
const CustomError = require("../../../helpers/customError");

module.exports.billingRepository = () => {
    return Object.freeze({
        insert,
        findToday,
        findList
    })

    async function insert(args){
        try{
            const newJournalDocument = await models().billingModel.insertMany(args)
            return newJournalDocument[0]
        }catch(err){
            throw new CustomError(500, err.message)
        }
    }

    async function findToday(id) {
        try{
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(new Date().getDate()-1)
            twoDaysAgo.setHours(0,0,0,0)
            const document = await models().billingModel.findOne({meter_id: new mongoose.Types.ObjectId(id), date: twoDaysAgo})
            return document
        }catch(err){
          throw new CustomError(500, err.message) 
        }
    }

    async function findList({ id, oneDate, twoDate }) {
      try {
            const meters = [];
            const feeder = {}
            const result = {}
            const callback = async({ id, oneDate, twoDate }) => {
              const find = await models().electObjectModel.find({ parent_object: id });
              for (let i = 0; i < find.length; i++) {
                  const currentItem = find[i];
                  if (currentItem.type === 'feeder') {
                    feeder[currentItem._id] = {name: currentItem.name, parent: String(currentItem.parent_object)}
                  }
                  if (currentItem.type !== 'meter') {
                      await callback({ id: currentItem._id, oneDate, twoDate }); 
                  } else {
                    if (currentItem.type) {
                      meters.push(currentItem);
                    }
                  }
              }
            }
            await callback({ id, oneDate, twoDate })

            const sDate = new Date(...oneDate);
            const fDate = new Date(...twoDate);
            sDate.setHours(0,0,0,0)
            fDate.setHours(0,0,0,0)

            for (let i = 0; i < meters.length; i++) {
              const billing = await models().billingModel.find({ meter_id: meters[i].meter_id })
              const oneData = billing.find(e => new Date(e.date) - sDate == 0)                                
              const twoData = billing.find(e => new Date(e.date) - fDate == 0)
              if(!oneData || !twoData)
                return {status: 404, message: "Birinchi yoki ikkinchi kunda ma'lumotlar yoq"}

              const meter = await models().meterModel.findOne({ _id: meters[i].meter_id })
              if(!Array.isArray(result[feeder[meters[i].parent_object].parent])) {
                result[feeder[meters[i].parent_object].parent] = []
              }

              result[feeder[meters[i].parent_object].parent].push({
                nomer: meter.number_meter,
                feeder: feeder[meters[i].parent_object].name,
                TT: meters[i].vt,
                TN: meters[i].ct,
                day1_A1: oneData.summa_A1,
                day1_A0: oneData.summa_A0,
                day1_R0: oneData.summa_R0,
                day1_R1: oneData.summa_R1,
                day2_A1: twoData.summa_A1,
                day2_A0: twoData.summa_A0,
                day2_R0: twoData.summa_R0,
                day2_R1: twoData.summa_R1,
                tarif1_A1: twoData.tarif1_A1 - oneData.tarif1_A1,
                tarif2_A1: twoData.tarif2_A1 - oneData.tarif2_A1,
                tarif3_A1: twoData.tarif3_A1 - oneData.tarif3_A1,
                tarif4_A1: twoData.tarif4_A1 - oneData.tarif4_A1,
                tarif1_A0: twoData.tarif1_A0 - oneData.tarif1_A0,
                tarif2_A0: twoData.tarif2_A0 - oneData.tarif2_A0,
                tarif3_A0: twoData.tarif3_A0 - oneData.tarif3_A0,
                tarif4_A0: twoData.tarif4_A0 - oneData.tarif4_A0,
                tarif1_R1: twoData.tarif1_R1 - oneData.tarif1_R1,
                tarif2_R1: twoData.tarif2_R1 - oneData.tarif2_R1,
                tarif3_R1: twoData.tarif3_R1 - oneData.tarif3_R1,
                tarif4_R1: twoData.tarif4_R1 - oneData.tarif4_R1,
                tarif1_R0: twoData.tarif1_R0 - oneData.tarif1_R0,
                tarif2_R0: twoData.tarif2_R0 - oneData.tarif2_R0,
                tarif3_R0: twoData.tarif3_R0 - oneData.tarif3_R0,
                tarif4_R0: twoData.tarif4_R0 - oneData.tarif4_R0,
              })
            }
            return result;
        } catch (error) {
            console.error('Error in findList:', error);
            throw new CustomError(500, error.message);
        }
    }
}
