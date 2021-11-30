const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error")

const dotenv = require("dotenv")
dotenv.config()

const jwtSecretKey = process.env.JWT_AUTH_SECRET_KEY

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next()
  }
  try {
    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
      throw new Error("Authentication failed check-auth.js")
    }
    const decodedToken = jwt.verify(token, jwtSecretKey)
    req.userData = { userId: decodedToken.userId }
    next()
  } catch (err) {
    const error = new HttpError("Authentication failed check-auth.js", 403)
    return next(error)
  }
}
