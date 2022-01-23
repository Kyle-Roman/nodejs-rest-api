const express = require('express')
const path = require('path')
const fs = require('fs/promises')
const Jimp = require('jimp')

const { User } = require('../../model/models')
const {authenticate, upload} = require('../../middlewares')

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
module.exports = router
