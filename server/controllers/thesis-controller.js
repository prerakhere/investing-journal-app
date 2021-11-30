const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")
const uuid = require("uuid").v4
const HttpError = require("../models/http-error")
const Vault = require("../models/vault")
const User = require("../models/user")
const ThesisPoint = require("../models/thesispoint")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()
const region = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
}
const s3 = new aws.S3({
  accessKeyId,
  secretAccessKey,
  region,
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]
      cb(null, `${uuid()}.${ext}`)
    },
  }),
  limits: { fileSize: 3000000 },
  fileFilter: function (req, file, cb) {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]
    let error = isValid ? null : new Error("Invalid mime type!")
    cb(error, isValid)
  },
})
const singleFileUpload = upload.single("fileInputField")

const uploadToS3 = (req, res) => {
  return new Promise((resolve, reject) => {
    return singleFileUpload(req, res, (err) => {
      if (err) return reject(err)
      return resolve(req.file)
    })
  })
}

const deleteThesisPointAttachment = async (req, res, next) => {
  const { fileName, uploadedFiles } = req.body
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  }

  try {
    await s3.headObject(params).promise()
    // console.log("File found in s3")
    try {
      await s3.deleteObject(params).promise()
      // console.log("File successfully deleted")
    } catch (error) {
      // console.log("Error in file deleting: " + JSON.stringify(error))
      const e = new HttpError(
        "Unable to delete file from S3 bucket, try again",
        500
      )
      return next(e)
    }
  } catch (err) {
    // console.log("File not found in S3: " + err.code + " " + err.message)
    const e = new HttpError("File not found in S3!", 404)
    return next(e)
  }

  let updatedUploadedFiles = uploadedFiles.filter((file) => {
    return file.key !== fileName
  })

  res.status(200).json({
    updatedUploadedFiles,
  })
}

const discardThesisPointAttachments = async (req, res, next) => {
  const { uploadedFiles } = req.body
  const fileNames = []

  uploadedFiles.map((file) => {
    fileNames.push({ Key: file.key })
  })

  const discardParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: [...fileNames],
    },
  }

  s3.deleteObjects(discardParams, (err, data) => {
    if (err) {
      const error = new HttpError(`${err.message}`, 500)
      return next(error)
    } else {
    }
  })

  res.status(200).json({ message: "Successfully deleted file from S3 bucket" })
}

const deleteThesisPointExistingAttachment = async (req, res, next) => {
  const { fileName, loadedFiles } = req.body
  let { thesisPointId } = req.params

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  }

  try {
    await s3.headObject(params).promise()
    try {
      await s3.deleteObject(params).promise()
    } catch (error) {
      const e = new HttpError(
        "Unable to delete file from S3 bucket, try again",
        500
      )
      return next(e)
    }
  } catch (err) {
    res.status(404).json({
      message: "File not found in S3 bucket",
    })
    return
  }

  let updatedLoadedFiles = loadedFiles.filter((file) => {
    return file.key !== fileName
  })

  let thesisPoint
  try {
    thesisPoint = await ThesisPoint.findById(thesisPointId)
  } catch (err) {
    const error = new HttpError(
      "Error in deleteThesisPointExistingAttachment: could not fetch the thesis point",
      500
    )
    return next(error)
  }

  if (!thesisPoint) {
    const error = new HttpError(
      "Error in deleteThesisPointExistingAttachment: thesis point does not exist",
      404
    )
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    ThesisPoint.findOneAndUpdate(
      { key: fileName },
      { $pull: { thesis_point_attachments: { key: fileName } } },
      { safe: true, multi: true },
      function (err, obj) {}
    )
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Error in deleteThesisPoint: error in transaction",
      500
    )
    return next(error)
  }

  res.status(200).json({
    updatedLoadedFiles,
  })
}

const uploadThesisPointAttachments = (req, res) => {
  uploadToS3(req, res)
    .then((file) => {
      return res.status(200).json({
        originalname: file.originalname,
        key: file.key,
        fileLocationUrl: file.location,
      })
    })
    .catch((err) => {})
}

const getThesisPointById = async (req, res, next) => {
  const { userId } = req.userData
  const { vaultId, thesisPointId } = req.params

  let thesisPoint
  try {
    thesisPoint = await ThesisPoint.findById(thesisPointId)
  } catch (err) {
    const error = new HttpError(
      "Error in getThesisPointById: could not fetch thesis point that is to updated",
      500
    )
    return next(error)
  }

  if (!thesisPoint) {
    const error = new HttpError(
      "Error in getThesisPointById: Could not find thesis point with this id",
      404
    )
    return next(error)
  }

  if (thesisPoint.thesis_vault.toString() !== vaultId) {
    const error = new HttpError(
      "Error in getThesisPointById: this thesis point does not belong to this vault id",
      401
    )
    return next(error)
  }

  res.status(200).json({ thesisPoint: thesisPoint.toObject({ getters: true }) })
}

const createThesisPoint = async (req, res, next) => {
  const { vaultId } = req.params
  const {
    thesis_point_title,
    thesis_point_description,
    thesis_point_attachments,
  } = req.body

  const date = new Date().toString().substring(4, 15)

  const createdThesisPoint = new ThesisPoint({
    thesis_point_date_created: date.slice(0, 6) + "," + date.slice(6),
    thesis_point_title,
    thesis_point_description,
    thesis_point_attachments,
    thesis_vault: vaultId,
  })

  let vault
  try {
    vault = await Vault.findById(vaultId)
  } catch (err) {
    const error = new HttpError(
      "Error in createThesisPoint: could not fetch vault to create thesis point for",
      500
    )
    return next(error)
  }

  if (!vault) {
    const error = new HttpError(
      "Error in createThesisPoint: vault not found",
      404
    )
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdThesisPoint.save({ session: sess })
    vault.vault_thesis.push(createdThesisPoint)
    await vault.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Error in createThesisPoint: something went wrong in DB",
      500
    )
    return next(error)
  }

  res.status(201).json({ thesis_point: createdThesisPoint })
}

const updateThesisPoint = async (req, res, next) => {
  const { vaultId, thesisPointId } = req.params
  const {
    thesis_point_title,
    thesis_point_description,
    thesis_point_attachments,
  } = req.body

  let thesisPoint
  try {
    thesisPoint = await ThesisPoint.findById(thesisPointId)
  } catch (err) {
    const error = new HttpError(
      "Error in updateThesisPoint: could not fetch thesis point that is to updated",
      500
    )
    return next(error)
  }

  if (thesisPoint.thesis_vault.toString() !== vaultId) {
    const error = new HttpError(
      "Error in updateThesisPoint: this thesis point does not belong to this vault id",
      401
    )
    return next(error)
  }

  thesisPoint.thesis_point_title = thesis_point_title
  thesisPoint.thesis_point_description = thesis_point_description
  for (const attachment of thesis_point_attachments) {
    thesisPoint.thesis_point_attachments.push(
      JSON.parse(JSON.stringify(attachment))
    )
  }

  try {
    await thesisPoint.save()
  } catch (err) {
    const error = new HttpError(
      "Error in updateThesisPoint: could not save the updated thesis point in DB",
      500
    )
    return next(error)
  }

  res.status(200).json({ thesisPoint: thesisPoint.toObject({ getters: true }) })
}

const deleteThesisPoint = async (req, res, next) => {
  const { vaultId, thesisPointId } = req.params
  const { filesToDelete } = req.body

  let thesisPointWithPopulatedThesisVault
  try {
    thesisPointWithPopulatedThesisVault = await ThesisPoint.findById(
      thesisPointId
    ).populate("thesis_vault")
  } catch (err) {
    const error = new HttpError(
      "Error in deleteThesisPoint: could not fetch the thesis point",
      500
    )
    return next(error)
  }

  if (!thesisPointWithPopulatedThesisVault) {
    const error = new HttpError(
      "Error in deleteThesisPoint: thesis point does not exist",
      404
    )
    return next(error)
  }

  if (thesisPointWithPopulatedThesisVault.thesis_vault.id !== vaultId) {
    const error = new HttpError(
      "Error in deleteThesisPoint: this thesis point does not belong to this vault",
      401
    )
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await thesisPointWithPopulatedThesisVault.remove({ session: sess })
    thesisPointWithPopulatedThesisVault.thesis_vault.vault_thesis.pull(
      thesisPointWithPopulatedThesisVault
    )
    await thesisPointWithPopulatedThesisVault.thesis_vault.save({
      session: sess,
    })
    await sess.commitTransaction()
  } catch (err) {
    const error = new HttpError(
      "Error in deleteThesisPoint: something went wrong in DB",
      500
    )
    return next(error)
  }

  // delete files of this thesis point from S3 bucket
  let fileNames = []
  filesToDelete.map((file) => {
    fileNames.push({ Key: file.key })
  })

  if (fileNames.length > 0) {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: [...fileNames],
      },
    }

    s3.deleteObjects(deleteParams, (err, data) => {
      if (err) {
        const error = new HttpError(`${err.message}`, 500)
        return next(error)
      } else {
      }
    })
  }

  res.status(200).json({ message: "Successfully deleted thesis point" })
}

exports.uploadThesisPointAttachments = uploadThesisPointAttachments
exports.getThesisPointById = getThesisPointById
exports.createThesisPoint = createThesisPoint
exports.updateThesisPoint = updateThesisPoint
exports.deleteThesisPoint = deleteThesisPoint
exports.deleteThesisPointAttachment = deleteThesisPointAttachment
exports.deleteThesisPointExistingAttachment =
  deleteThesisPointExistingAttachment
exports.discardThesisPointAttachments = discardThesisPointAttachments
