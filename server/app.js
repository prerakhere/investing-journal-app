const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const usersRoutes = require("./routes/users-routes")
const vaultsRoutes = require("./routes/vaults-routes")
const HttpError = require("./models/http-error")
const compression = require("compression")

dotenv.config()

const app = express()

app.use(compression())
app.use(express.urlencoded({ extended: true }))
app.use(cors(), express.json())

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  res.setHeader("Access-Control-Allow-Credentials", true)

  next()
})
const url = process.env.MONGODB_CONNECTION_URL

app.use("/api/vaults", vaultsRoutes)
app.use("/api/users", usersRoutes)

// middlewares for deploying to heroku
app.use(express.static(path.join(__dirname, "/client/build")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"))
})

app.use((req, res, next) => {
  const error = new HttpError("Can't find this API route", 404)
  throw error
})

// error handling middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res.status(error.code || 500)
  res.json({ message: error.message || "app.js: unknown error occured" })
})

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 5004)
  })
  .catch((error) => {
    console.log(error)
  })
