const express = require('express')
const { joiSchema } = require('../../model/models/user')
const bcrypt = require('bcryptjs')
const { BadRequest, Conflict, Unauthorized } = require('http-errors')

const { User } = require('../../model/models')

const router = express.Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      throw new BadRequest(error.message)
    }
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
      throw new Conflict('Email in use')
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    const newUser = await User.create({ email, password: hashPassword })
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      }
    })
  } catch (error) {
    if (error.message.includes('validation failed')) {
      error.status = 400
    }
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      throw new BadRequest(error.message)
    }
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw new Unauthorized('Email or password is wrong')
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      throw new Unauthorized('Email or password is wrong')
    }
    // res.status(201).json({
    //   user: {
    //     email: newUser.email,
    //     subscription: newUser.subscription,
    //   }
    // })
  } catch (error) {
    if (error.message.includes('validation failed')) {
      error.status = 400
    }
    next(error)
  }
})
module.exports = router
