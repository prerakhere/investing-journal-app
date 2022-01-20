const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')
const User = require('../models/user')

const dotenv = require('dotenv')
dotenv.config()

const jwtSecretKey = process.env.JWT_AUTH_SECRET_KEY

const signup = async (req, res, next) => {
  const { name, email, password } = req.body
  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    console.log(
      'Sign up failed, unable to check if user with this email already exists or not'
    )
    res.status(500).json({
      message: 'Something went wrong in checking the email',
    })
    return
  }
  if (existingUser) {
    res.status(422).json({
      message: 'User already exists',
    })
    return
  }
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    console.log('Error in signup: Could not hash password')
    res.status(500).json({
      message: 'Something went wrong in processing password',
    })
    return
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    vaults: [],
  })
  try {
    await createdUser.save()
  } catch (err) {
    console.log("Signing up failed, can't save the created user")
    res.status(500).json({
      message: 'Something went wrong in saving the created user',
    })
    return
  }
  let token
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      jwtSecretKey,
      { expiresIn: '1d' }
    )
  } catch (err) {
    console.log("Signing up failed, can't generate token")
    res.status(500).json({
      message: 'Something went wrong in generating token',
    })
    return
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token })
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    console.log(
      'Login failed, unable to check if user with this email already exists or not'
    )
    res.status(500).json({
      message: 'Something went wrong in checking the email',
    })
    return
  }
  if (!existingUser) {
    res.status(404).json({
      message: 'User not found',
    })
    return
  }
  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    console.log('Error in login: Could not compare pw and hashed pw, try again')
    res.status(500).json({
      message: 'Something went wrong in validating password',
    })
    return
  }

  if (!isValidPassword) {
    res.status(403).json({
      message: 'Incorrect Password',
    })
    return
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      jwtSecretKey,
      { expiresIn: '1d' }
    )
  } catch (err) {
    console.log('Login failed, could not generate token')
    res.status(500).json({
      message: 'Something went wrong in generating token',
    })
    return
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    message: 'Logged in',
  })
}

exports.signup = signup
exports.login = login
