const express = require('express')
const router = express.Router()
const moment = require('moment')
const fs = require('fs/promises')
const { NotFound, BadRequest } = require('http-errors')

const { Contact, joiSchema } = require('../../model/models/contact')

const authenticate = require('../../middlewares/authenticate')

router.use(async(req, res, next) => {
  const { method, url } = req
  const { statusCode } = res
  const date = moment().format('DD.MM.YYYY_hh:mm:ss')
  const str = `\n${method} ${url} ${date} ${statusCode}`
  await fs.appendFile('server.log', str)
  next()
})

router.get('/', authenticate, async (req, res, next) => {
  try {
    const {page = 1, limit = 2, favorite} = req.query
    const skip = (page - 1) * limit
    const {_id} = req.user
    const contacts = await Contact.find({owner: _id}, '', {skip, limit: +limit, favorite})
    
    res.json(contacts)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const contact = await Contact.findById(id)
    if (!contact) {
      throw new NotFound()
    }
    res.json(contact)
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 404
    }
    next(error)
  }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      throw new BadRequest(error.message)
    }
    const {_id} = req.user
    const newContact = await Contact.create({...req.body, owner: _id})
    res.status(201).json(newContact)
  } catch (error) {
    if (error.message.includes('validation failed')) {
      error.status = 400
    }
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const deleteContact = await Contact.findByIdAndRemove(id)
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
    const { id } = req.params
    const updateContact = await Contact.findByIdAndUpdate(id, req.body, { new: true })
    if (!updateContact) {
      throw new NotFound()
    }
    res.json(updateContact)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/favorite', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body)
    if (error) {
      error.message = 'missing field favorite'
      error.status = 400
      throw error
    }
    const { id } = req.params
    const { favorite } = req.body
    const updateStatusContact = await Contact.findByIdAndUpdate(id, { favorite }, { new: true })
    if (!updateStatusContact) {
      throw new NotFound()
    }
    res.json(updateStatusContact)
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 404
    }
    next(error)
  }
})

module.exports = router
