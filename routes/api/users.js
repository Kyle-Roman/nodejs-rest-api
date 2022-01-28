const express = require('express')

const { User } = require('../../model/models')
const {authenticate} = require('../../middlewares')

const router = express.Router()

router.get('/current', authenticate, async(req, res) => {
    const {email, subscription} = req.user
    res.json({
        user: {
            email,
            subscription
        }
    })
})

router.get('/logout', authenticate, async(req, res) => {
    const {_id} = req.user
    await User.findByIdAndUpdate(_id, {token: null})
    res.status(204).send()
})

router.get('/users/verify/:verificationToken', authenticate, async(req, res) => {
    const {token} = req.user
    await User.findOne(token)
})
module.exports = router
