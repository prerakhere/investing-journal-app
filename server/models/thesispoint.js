const mongoose = require("mongoose")

const Schema = mongoose.Schema

const thesisPointSchema = new Schema({
  thesis_point_date_created: { type: String, required: true },
  thesis_point_title: { type: String, required: true },
  thesis_point_description: { type: String },
  thesis_point_attachments: [
    {
      key: { type: String },
      originalname: { type: String },
      fileLocationUrl: { type: String },
    },
  ],
  thesis_vault: { type: mongoose.Types.ObjectId, required: true, ref: "Vault" },
})

module.exports = mongoose.model("ThesisPoint", thesisPointSchema)
