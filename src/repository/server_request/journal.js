const mongoose = require("mongoose");
const { journalModel } = require("../../models")
const CustomError = require("../../utils/custom_error")

module.exports.journalRepository = () => {
  return Object.freeze({
    insert,
    findLastInserted,
    findLastSuccesfullyInserted,
    findAll,
    update
  })

  async function insert(args) {
    try {
      const newJournalDocument = await journalModel.insertMany(args)
      return newJournalDocument[0]
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function update(args) {
    try {
      const updatedDocument = await journalModel.updateOne({ _id: new mongoose.Types.ObjectId(args._id) }, { status: args.status })
      return updatedDocument
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findLastInserted(args) {
    try {
      const lastInsertedArchiveDocument = await journalModel.find({ meter: new mongoose.Types.ObjectId(args.meter_id), request_type: "archive" }).sort({ "createdAt": -1 }).limit(1)
      const lastInsertedCurrentDocument = await journalModel.find({ meter: new mongoose.Types.ObjectId(args.meter_id), request_type: "current" }).sort({ "createdAt": -1 }).limit(1)
      return { lastInsertedArchiveDocument, lastInsertedCurrentDocument }
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findLastSuccesfullyInserted(args) {
    try {
      const lastInsertedArchiveDocument = await journalModel.find({ meter: new mongoose.Types.ObjectId(args.meter_id), request_type: "archive", status: "succeed" }).sort({ "createdAt": -1 }).limit(1)
      const lastInsertedCurrentDocument = await journalModel.find({ meter: new mongoose.Types.ObjectId(args.meter_id), request_type: "current", status: "succeed" }).sort({ "createdAt": -1 }).limit(1)
      return { lastInsertedArchiveDocument, lastInsertedCurrentDocument }
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findAll(args) {
    try {

      const journalDocuments = await journalModel.find({ meter: new mongoose.Types.ObjectId(args.meter_id) }).sort({ "createdAt": -1 })
      return journalDocuments
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }
}