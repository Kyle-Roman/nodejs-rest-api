const express = require('express')
const path = require('path')
const fs = require('fs/promises')
const Jimp = require('jimp')
const {NotFound, BadRequest} = require('http-errors')

const { User } = require('../../model/models')
const {authenticate, upload} = require('../../middlewares')
const {sendMail} = require('../../sendgrid/helpers')
const {SITE_NAME} = process.env

const router = express.Router()

const avatarsDir = path.join(__dirname, '../../', 'public', 'avatars')

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

router.patch('/avatars', authenticate, upload.single('avatar'), async(req, res, next) => {
    const { path: tempUpload, filename } = req.file
    const [extension] = filename.split('.').reverse()
    const newFileName = `${req.user._id}.${extension}`
    const fileUpload = path.join(avatarsDir, newFileName)
    try {
        Jimp.read(tempUpload)
        .then((image) => {
          image.resize(250, 250).write(fileUpload);
        })
        .catch((err) => {
          next(err);
        });
        await fs.rename(tempUpload, fileUpload)
        const avatarURL = path.join('avatars', newFileName)
        await User.findByIdAndUpdate(req.user._id, {avatarURL}, {new: true})
        res.json({avatarURL})    
    } catch (error) {
        next(error)
    }
})

router.get('/verify/:verificationToken', async(req, res, next) => {
    try {
        const {verificationToken} = req.params
        const user = await User.findOne({verificationToken}) 
        if(!user) {
            throw new NotFound('User not found')
        }
        await User.findByIdAndUpdate(user._id, {verificationToken: null, verify: true})
        res.json({ message: 'Verification successful'})
    } catch (error) {
        next(error)
    }

})

router.get('/verify', async(req, res, next) => {
    try {
        const {email} = req.body
        if(!email) {
            throw new BadRequest('missing required field email')
        }
        const user = await User.findOne(email)
        if(!user) {
            throw new NotFound('User not found')
        }
        if(user.verify) {
            throw new BadRequest('Verification has already been passed')
        }

        const {verificationToken} = user
        const data = {
            to: email,
            subject: 'Подтвердить email',
            html: `<a target='_blank' href='${SITE_NAME}/users/verify/:${verificationToken}'>Подтвердить email</a>`
          }
      
          await sendMail(data)
        
        res.json({ message: 'Verification email sent'})
    } catch (error) {
        next(error)
    }

})

module.exports = router
