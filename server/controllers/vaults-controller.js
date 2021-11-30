const HttpError = require("../models/http-error")
const Vault = require("../models/vault")
const User = require("../models/user")
const ThesisPoint = require("../models/thesispoint")
const mongoose = require("mongoose")

const getMinimalVaultById = async (req, res, next) => {
  const { userId } = req.userData
  const { vaultId } = req.params

  let vault
  try {
    vault = await Vault.findById(vaultId)
  } catch (err) {
    const error = new HttpError(
      "Error in getMinimalVaultById: unable to get the vault",
      500
    )
    return next(error)
  }
  if (!vault) {
    const error = new HttpError(
      "Error in getMinimalVaultById: Could not find a vault for the provided id",
      404
    )
    return next(error)
  }
  if (vault.vault_creator.toString() !== userId) {
    const error = new HttpError(
      "Error in getMinimalVaultById: this vault does not belong to user with this user id",
      401
    )
    return next(error)
  }
  // setting getters to true removes the _ in the _id property
  res.json({
    vault: vault.toObject({ getters: true }),
  })
}

const getVaultById = async (req, res, next) => {
  const { userId } = req.userData
  const { vaultId } = req.params

  let vault
  try {
    vault = await Vault.findById(vaultId)
  } catch (err) {
    const error = new HttpError(
      "Error in getVaultById: unable to get the vault",
      500
    )
    return next(error)
  }

  if (!vault) {
    const error = new HttpError(
      "Error in getVaultById: Could not find a vault for the provided id",
      404
    )
    return next(error)
  }

  if (vault.vault_creator.toString() !== userId) {
    const error = new HttpError(
      "Error in getVaultById: this vault does not belong to user with this user id",
      401
    )
    return next(error)
  }

  let vaultWithPopulatedThesis
  try {
    vaultWithPopulatedThesis = await Vault.findById(vaultId).populate(
      "vault_thesis"
    )
  } catch (err) {
    const error = new HttpError(
      "Error in getVaultById: fetching vault with populated thesis points failed",
      500
    )
    return next(error)
  }

  if (!vaultWithPopulatedThesis) {
    const error = new HttpError(
      "Error in getVaultById: vault (with populated thesis points) not found",
      404
    )
    return next(error)
  }

  if (vaultWithPopulatedThesis.vault_thesis.length === 0) {
    res.json({
      vault: vault.toObject({ getters: true }),
      message: "Vault has no thesis",
    })
  } else {
    res.json({
      vault: vault.toObject({ getters: true }),
      thesis: vaultWithPopulatedThesis.vault_thesis.map((thesisPoint) =>
        thesisPoint.toObject({ getters: true })
      ),
    })
  }
}

const getVaults = async (req, res, next) => {
  const { userId } = req.userData

  let userWithPopulatedVaults
  try {
    userWithPopulatedVaults = await User.findById(userId).populate("vaults")
  } catch (err) {
    const error = new HttpError(
      "Error in getVaults: fetching user of this user id failed",
      500
    )
    return next(error)
  }

  if (!userWithPopulatedVaults) {
    const error = new HttpError(
      "Error in getVaults: user with this user id does not exist",
      404
    )
    return next(error)
  }

  if (userWithPopulatedVaults.vaults.length === 0) {
    res.json({
      message: "User has no vaults",
    })
  } else {
    res.json({
      vaults: userWithPopulatedVaults.vaults.map((vault) =>
        vault.toObject({ getters: true })
      ),
    })
  }
}

const createVault = async (req, res, next) => {
  const { vault_name, vault_sector } = req.body

  let existingVault
  try {
    existingVault = await Vault.findOne({ vault_name: vault_name })
  } catch (err) {
    const error = new HttpError(
      "Error in createVault: failed checking if vault with this vault name exists or not",
      500
    )
    return next(error)
  }

  if (existingVault) {
    const error = new HttpError(
      "Error in createVault: Vault with this name already exists",
      422
    )
    return next(error)
  }

  const createdVault = new Vault({
    vault_name,
    vault_sector,
    vault_thesis: [],
    vault_creator: req.userData.userId,
  })

  let user
  try {
    user = await User.findById(req.userData.userId)
  } catch (err) {
    const error = new HttpError(
      "Error in createVault: finding user to create vault for failed",
      500
    )
    return next(error)
  }

  if (!user) {
    const error = new HttpError(
      "Error in createVault: user does not exist",
      404
    )
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdVault.save({ session: sess })
    user.vaults.push(createdVault)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Error in createVault: something went wrong while creating vault in DB",
      500
    )
    return next(error)
  }
  res.status(201).json({ vault: createdVault })
}

const updateVault = async (req, res, next) => {
  const { vault_name, vault_sector } = req.body
  const { vaultId } = req.params
  const { userId } = req.userData

  let vault
  try {
    vault = await Vault.findById(vaultId)
  } catch (err) {
    const error = new HttpError(
      "Error in updateVault: could not fetch vault that is to updated",
      500
    )
    return next(error)
  }

  if (vault.vault_creator.toString() !== userId) {
    const error = new HttpError(
      "Error in updateVault: this vault does not belong to user with this user id",
      401
    )
    return next(error)
  }

  vault.vault_name = vault_name
  vault.vault_sector = vault_sector

  try {
    await vault.save()
  } catch (err) {
    const error = new HttpError(
      "Error in updateVault: could not save the updatedVault in DB",
      500
    )
    return next(error)
  }

  res.status(200).json({ vault: vault.toObject({ getters: true }) })
}

const deleteVault = async (req, res, next) => {
  const { vaultId } = req.params

  let vaultWithPopulatedVaultCreator
  try {
    vaultWithPopulatedVaultCreator = await Vault.findById(vaultId).populate(
      "vault_creator"
    )
  } catch (err) {
    const error = new HttpError(
      "Error in deleteVault: could not fetch the vault (with populated vault creator)",
      500
    )
    return next(error)
  }
  if (!vaultWithPopulatedVaultCreator) {
    const error = new HttpError(
      "Error in deleteVault: vault does not exist",
      404
    )
    return next(error)
  }

  if (vaultWithPopulatedVaultCreator.vault_creator.id !== req.userData.userId) {
    const error = new HttpError(
      "Error in deleteVault: this vault does not belong to this user id",
      401
    )
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await vaultWithPopulatedVaultCreator.remove({ session: sess })
    vaultWithPopulatedVaultCreator.vault_creator.vaults.pull(
      vaultWithPopulatedVaultCreator
    )
    await vaultWithPopulatedVaultCreator.vault_creator.save({ session: sess })
    await ThesisPoint.deleteMany({ thesis_vault: vaultId })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Error in deleteVault: something went wrong while deleting vault from DB",
      500
    )
    return next(error)
  }

  res.status(200).json({ message: "Successfully deleted vault" })
}

exports.getMinimalVaultById = getMinimalVaultById
exports.getVaultById = getVaultById
exports.getVaults = getVaults
exports.createVault = createVault
exports.updateVault = updateVault
exports.deleteVault = deleteVault
