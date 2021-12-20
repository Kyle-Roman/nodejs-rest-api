const express = require('express')
const router = express.Router()
const moment = require('moment')
const fs = require('fs/promises')
const { NotFound, BadRequest } = require('http-errors')
const Joi = require('joi')
const contactsController = require('../../model/index.js')

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
})

router.use(async(req, res, next) => {
  const { method, url } = req
  const { statusCode } = res
  const date = moment().format('DD.MM.YYYY_hh:mm:ss')
  const str = `\n${method} ${url} ${date} ${statusCode}`
  await fs.appendFile('server.log', str)
  next()
})

router.get('/', async (req, res, next) => {
  try {
    const contacts = await contactsController.listContacts()
    res.json(contacts)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const contact = await contactsController.getContactById(id)
    if (!contact) {
      throw new NotFound()
    }
    res.json(contact)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      throw new BadRequest(error.message)
    }
    const newContact = await contactsController.addContact(req.body)
    res.status(201).json(newContact)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const deleteContact = await contactsController.removeContact(id)
    if (!deleteContact) {
      throw new NotFound()
    }
    res.json({ message: 'contact deleted' })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      throw new BadRequest('message: missing fields')
    }
    const { id } = req.params
    const updateContact = await contactsController.updateContact(id, req.body)
    if (!updateContact) {
      throw new NotFound()
    }
    res.json(updateContact)
  } catch (error) {
    next(error)
  }
})

module.exports = router
