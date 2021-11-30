const mongoose = require("mongoose")

const Schema = mongoose.Schema

const vaultSchema = new Schema({
  vault_name: { type: String, required: true, unique: true },
  vault_sector: { type: String },
  vault_thesis: [{ type: mongoose.Types.ObjectId, ref: "ThesisPoint" }],
  vault_creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
})

module.exports = mongoose.model("Vault", vaultSchema)
