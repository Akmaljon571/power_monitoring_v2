const { default: mongoose } = require("mongoose");
const { models } = require("../../models/index");
const CustomError = require("../../utils/custom_error")

module.exports.folderObjectRepository = () => {
  return Object.freeze({
    insert,
    findAll,
    findOne,
    updateOne,
  });

  async function insert(args) {
    const newFolderDocument = await models().folderModel.insertMany(args);

    return newFolderDocument;
  }

  async function findAll(query) {
    try {
      const limit = query && query.limit ? query.limit : 150;

      const pipArray = [
        {
          $match: {
            // parent_id: {
            $or: [{ parent_id: { $exists: false } }, { parent_id: null }],
            // }
          },
        },
        {
          $lookup: {
            from: "meter",
            localField: "meters",
            foreignField: "_id",
            as: "meter_detail",
          },
        },
        {
          $lookup: {
            from: "uspds",
            localField: "uspd",
            foreignField: "_id",
            as: "uspd_detail",
          },
        },
        {
          $lookup: {
            from: "folders",
            localField: "_id",
            foreignField: "parent_id",
            as: "child_folders",
          },
        },
        {
          $unwind: {
            path: "$meter_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$uspd_detail",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            date: -1,
          },
        },
        {
          $limit: limit,
        },
      ];

      const folders = await models().folderModel.aggregate(pipArray, {
        maxTimeMS: 50000,
      });
      return folders;
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function findOne(id, query) {
    try {
      const pipArray = [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "meters",
            localField: "meter",
            foreignField: "_id",
            pipeline: [
              {
                $lookup: {
                   from: "parameters",
                   localField: "_id",
                   foreignField: "meter",
                   as: "params"
                }
              }
            ],
            as: "meter_detail",
          },
        },
        {
          $lookup: {
            from: "uspds",
            localField: "uspd",
            foreignField: "_id",
            as: "uspd_detail",
          },
        },
        {
          $lookup: {
            from: "folders",
            localField: "_id",
            foreignField: "parent_id",
            as: "child_folders",
          },
        },
        {
          $unwind: {
            path: "$meter_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$uspd_detail",
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $sort: {
        //     date: -1,
        //   },
        // },
        // {
        //   $limit: 1,
        // },
      ];

      const folder = await models().folderModel.aggregate(pipArray, {
        maxTimeMS: 50000,
      });
      if (folder[0].meter_detail) {
        folder[0].meter_detail.params = folder[0].meter_detail.params.filter(e => e.status == 'active')
        console.log(folder[0].meter_detail)
      }
      return folder[0];
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }

  async function updateOne(id, args) {
    try {
      const folderDocument = await models().folderModel.updateOne({
        parent_id: new mongoose.Types.ObjectId(id)
      }, args);
      return folderDocument;
    } catch (err) {
      throw new CustomError(500, err.message)
    }
  }
};
