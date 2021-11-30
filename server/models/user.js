const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vaults: [{ type: mongoose.Types.ObjectId, ref: "Vault" }],
})

module.exports = mongoose.model("User", userSchema)
