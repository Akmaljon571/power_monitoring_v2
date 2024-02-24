const { default: mongoose } = require("mongoose");
const { electObjectModel, meterModel, billingModel } = require("../../models");
const CustomError = require("../../utils/custom_error")

module.exports.billingRepository = () => {
  return Object.freeze({
    insert,
    findToday,
    findList
  })

  async function insert(args) {
    try {
      const newJournalDocument = await billingModel.insertMany(args)
      return newJournalDocument[0]
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findToday(id) {
    try {
      const yesterday = new Date();
      yesterday.setUTCHours(0, 0, 0, 0)
      yesterday.setDate(new Date().getDate() - 1)

      const document = await billingModel.findOne({ meter_id: new mongoose.Types.ObjectId(id), date: yesterday })
      return document
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findList(id, oneDate, twoDate) {
    try {
      const meters = [];
      const feeder = {}
      const result = {}
      const callback = async ({ id, oneDate, twoDate }) => {
        const find = await electObjectModel.find({ parent_object: id });
        for (let i = 0; i < find.length; i++) {
          const currentItem = find[i];
          if (currentItem.type === 'feeder') {
            feeder[currentItem._id] = { name: currentItem.name, parent: String(currentItem.parent_object) }
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
      const element = await electObjectModel.findById(id)

      const callbackFeeder = async ({ id, oneDate, twoDate }) => {
        if (element.type == 'feeder') {
          const find = await electObjectModel.find({ parent_object: id });
          for (let i = 0; i < find.length; i++) {
            feeder[element._id] = { name: element.name, parent: String(element.parent_object) }
            if (find[i].type) {
              meters.push(find[i]);
            }
          }
        } else {
          const find = await electObjectModel.findById({ _id: element.parent_object });
          feeder[find._id] = { name: find.name, parent: String(find.parent_object) }
          if (element.type) {
            meters.push(element);
          }
        }
      }

      if (element.type != 'feeder' && element.type != 'meter') {
        await callback({ id, oneDate, twoDate })
      } else {
        await callbackFeeder({ id, oneDate, twoDate })
      }

      const sDate = new Date(oneDate);
      const fDate = new Date(twoDate);
      sDate.setUTCHours(0, 0, 0, 0)
      fDate.setUTCHours(0, 0, 0, 0)
      sDate.setDate(sDate.getDate() + 1)
      fDate.setDate(fDate.getDate() + 1)

      for (let i = 0; i < meters.length; i++) {
        const billing = await billingModel.find({ meter_id: meters[i].meter_id })
        const oneData = billing.find(e => new Date(e.date) - sDate == 0)
        const twoData = billing.find(e => new Date(e.date) - fDate == 0)
        if (!oneData || !twoData)
          return { status: 404, message: "Birinchi yoki ikkinchi kunda ma'lumotlar yoq" }

        const meter = await meterModel.findOne({ _id: meters[i].meter_id })
        if (!Array.isArray(result[feeder[meters[i].parent_object].parent])) {
          result[feeder[meters[i].parent_object].parent] = []
        }

        console.log(oneData, twoData)
        result[feeder[meters[i].parent_object].parent].push({
          nomer: meter.number_meter,
          feeder: feeder[meters[i].parent_object].name,
          TT: meters[i].vt,
          TN: meters[i].ct,
          day1_A1: oneData.summa_A1 || null,
          day1_A0: oneData.summa_A0 || null,
          day1_R0: oneData.summa_R0 || null,
          day1_R1: oneData.summa_R1 || null,
          day2_A1: twoData.summa_A1 || null,
          day2_A0: twoData.summa_A0 || null,
          day2_R0: twoData.summa_R0 || null,
          day2_R1: twoData.summa_R1 || null,
          tarif1_A1: oneData.tarif1_A1 != undefined && twoData.tarif1_A1 != undefined ? twoData.tarif1_A1 - oneData.tarif1_A1 : null,
          tarif2_A1: oneData.tarif2_A1 != undefined && twoData.tarif2_A1 != undefined ? twoData.tarif2_A1 - oneData.tarif2_A1 : null,
          tarif3_A1: oneData.tarif3_A1 != undefined && twoData.tarif3_A1 != undefined ? twoData.tarif3_A1 - oneData.tarif3_A1 : null,
          tarif4_A1: oneData.tarif4_A1 != undefined && twoData.tarif4_A1 != undefined ? twoData.tarif4_A1 - oneData.tarif4_A1 : null,
          tarif1_A0: oneData.tarif1_A0 != undefined && twoData.tarif1_A0 != undefined ? twoData.tarif1_A0 - oneData.tarif1_A0 : null,
          tarif2_A0: oneData.tarif2_A0 != undefined && twoData.tarif2_A0 != undefined ? twoData.tarif2_A0 - oneData.tarif2_A0 : null,
          tarif3_A0: oneData.tarif3_A0 != undefined && twoData.tarif3_A0 != undefined ? twoData.tarif3_A0 - oneData.tarif3_A0 : null,
          tarif4_A0: oneData.tarif4_A0 != undefined && twoData.tarif4_A0 != undefined ? twoData.tarif4_A0 - oneData.tarif4_A0 : null,
          tarif1_R1: oneData.tarif1_R1 != undefined && twoData.tarif1_R1 != undefined ? twoData.tarif1_R1 - oneData.tarif1_R1 : null,
          tarif2_R1: oneData.tarif2_R1 != undefined && twoData.tarif2_R1 != undefined ? twoData.tarif2_R1 - oneData.tarif2_R1 : null,
          tarif3_R1: oneData.tarif3_R1 != undefined && twoData.tarif3_R1 != undefined ? twoData.tarif3_R1 - oneData.tarif3_R1 : null,
          tarif4_R1: oneData.tarif4_R1 != undefined && twoData.tarif4_R1 != undefined ? twoData.tarif4_R1 - oneData.tarif4_R1 : null,
          tarif1_R0: oneData.tarif1_R0 != undefined && twoData.tarif1_R0 != undefined ? twoData.tarif1_R0 - oneData.tarif1_R0 : null,
          tarif2_R0: oneData.tarif2_R0 != undefined && twoData.tarif2_R0 != undefined ? twoData.tarif2_R0 - oneData.tarif2_R0 : null,
          tarif3_R0: oneData.tarif3_R0 != undefined && twoData.tarif3_R0 != undefined ? twoData.tarif3_R0 - oneData.tarif3_R0 : null,
          tarif4_R0: oneData.tarif4_R0 != undefined && twoData.tarif4_R0 != undefined ? twoData.tarif4_R0 - oneData.tarif4_R0 : null,
        })
      }
      console.log(result)
      return result;
    } catch (error) {
      console.error('Error in findList:', error);
      throw new CustomError(500, error.message);
    }
  }
}
