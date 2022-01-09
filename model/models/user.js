const { Schema, model } = require('mongoose')
const Joi = require('Joi')
// const bcrypt = require('bcryptjs')

const emailRegexp = /^\w+([.-]?\w+)+@\w+([.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/

const userSchema = Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter'
  },
  token: {
    type: String,
    default: null,
  },
})

const joiSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
})

const User = model('user', userSchema)

module.exports = { User, joiSchema }
