const HttpError = require('../models/http-error')
const Vault = require('../models/vault')
const User = require('../models/user')
const ThesisPoint = require('../models/thesispoint')
const mongoose = require('mongoose')

const getMinimalVaultById = async (req, res, next) => {
  const { userId } = req.userData
  const { vaultId } = req.params

  let vault
  try {
    vault = await Vault.findById(vaultId)
  } catch (err) {
    console.log('Error in getMinimalVaultById: unable to get the vault')
    res.status(500).json({
      message: 'Something went wrong in generating token',
    })
    return
  }
  if (!vault) {
    console.log(
      'Error in getMinimalVaultById: Could not find a vault for the provided id'
    )
    res.status(404).json({
      message: 'Could not find a vault with this id',
    })
    return
  }
  if (vault.vault_creator.toString() !== userId) {
    console.log(
      'Error in getMinimalVaultById: this vault does not belong to user with this user id'
    )
    res.status(401).json({
      message: 'This vault does not belong to the logged in user',
    })
    return
  }
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
    console.log('Error in getVaultById: unable to get the vault')
    res.status(500).json({
      message: 'Something went wrong, unable to get the vault',
    })
    return
  }

  if (!vault) {
    console.log(
      'Error in getVaultById: Could not find a vault for the provided id'
    )
    res.status(404).json({
      message: 'Could not find a vault with this id',
    })
    return
  }

  if (vault.vault_creator.toString() !== userId) {
    console.log(
      'Error in getVaultById: this vault does not belong to user with this user id'
    )
    res.status(401).json({
      message: 'This vault does not belong to the logged in user',
    })
    return
  }

  let vaultWithPopulatedThesis
  try {
    vaultWithPopulatedThesis = await Vault.findById(vaultId).populate(
      'vault_thesis'
    )
  } catch (err) {
    console.log(
      'Error in getVaultById: fetching vault with populated thesis points failed'
    )
    res.status(500).json({
      message: 'Something went wrong, fetching vault failed',
    })
    return
  }

  if (!vaultWithPopulatedThesis) {
    console.log(
      'Error in getVaultById: vault (with populated thesis points) not found'
    )
    res.status(404).json({
      message: 'Vault not found',
    })
    return
  }

  if (vaultWithPopulatedThesis.vault_thesis.length === 0) {
    res.json({
      vault: vault.toObject({ getters: true }),
      thesis: [],
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
    userWithPopulatedVaults = await User.findById(userId).populate('vaults')
  } catch (err) {
    console.log('Error in getVaults: fetching user of this user id failed')
    res.status(500).json({
      message: 'Something went wrong, fetching user failed',
    })
    return
  }

  if (!userWithPopulatedVaults) {
    console.log('Error in getVaults: user with this user id does not exist')
    res.status(404).json({
      message: 'User with this user id not found',
    })
    return
  }

  if (userWithPopulatedVaults.vaults.length === 0) {
    res.json({
      message: 'User has no vaults',
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
    console.log(
      'Error in createVault: failed checking if vault with this vault name exists or not'
    )
    res.status(500).json({
      message: 'Something went wrong, checking existing vault name failed',
    })
    return
  }

  if (existingVault) {
    console.log('Error in createVault: Vault with this name already exists')
    res.status(422).json({
      message: 'Vault name already exists',
    })
    return
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
    console.log('Error in createVault: finding user to create vault for failed')
    res.status(500).json({
      message: 'Something went wrong, fetching user failed',
    })
    return
  }

  if (!user) {
    console.log('Error in createVault: user does not exist')
    res.status(404).json({
      message: 'User does not exist',
    })
    return
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdVault.save({ session: sess })
    user.vaults.push(createdVault)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(
      'Error in createVault: something went wrong while creating vault in DB'
    )
    res.status(500).json({
      message: 'Something went wrong while creating vault in DB',
    })
    return
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
    console.log(
      'Error in updateVault: could not fetch vault that is to updated'
    )
    res.status(500).json({
      message:
        'Something went wrong, could not fetch vault that is to be updated',
    })
    return
  }

  if (vault.vault_creator.toString() !== userId) {
    console.log(
      'Error in updateVault: this vault does not belong to user with this user id'
    )
    res.status(401).json({
      message: 'This vault does not belong to the logged in user',
    })
    return
  }

  vault.vault_name = vault_name
  vault.vault_sector = vault_sector

  try {
    await vault.save()
  } catch (err) {
    console.log('Error in updateVault: could not save the updatedVault in DB')
    res.status(500).json({
      message: 'Something went wrong while creating vault in DB',
    })
    return
  }

  res.status(200).json({ vault: vault.toObject({ getters: true }) })
}

const deleteVault = async (req, res, next) => {
  const { vaultId } = req.params

  let vaultWithPopulatedVaultCreator
  try {
    vaultWithPopulatedVaultCreator = await Vault.findById(vaultId).populate(
      'vault_creator'
    )
  } catch (err) {
    console.log(
      'Error in deleteVault: could not fetch the vault (with populated vault creator)'
    )
    res.status(500).json({
      message: 'Something went wrong, could not fetch the vault',
    })
    return
  }
  if (!vaultWithPopulatedVaultCreator) {
    console.log('Error in deleteVault: vault does not exist')
    res.status(404).json({
      message: 'Vault does not exist',
    })
    return
  }

  if (vaultWithPopulatedVaultCreator.vault_creator.id !== req.userData.userId) {
    console.log(
      'Error in deleteVault: this vault does not belong to this user id'
    )
    res.status(401).json({
      message: 'This vault does not belong to the logged in user',
    })
    return
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
    console.log('Error in deleteVault: transaction')
    res.status(500).json({
      message: 'Something went wrong while deleting vault from DB',
    })
    return
  }

  res.status(200).json({ message: 'Successfully deleted vault' })
}

exports.getMinimalVaultById = getMinimalVaultById
exports.getVaultById = getVaultById
exports.getVaults = getVaults
exports.createVault = createVault
exports.updateVault = updateVault
exports.deleteVault = deleteVault
