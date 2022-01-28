const sgMail = require('@sendgrid/mail')
const {NotFound} = require('http-errors')
require('dotenv').config()

const {SENDGRID_API_KEY} = process.env

sgMail.setApiKey(SENDGRID_API_KEY)

const sendMail = async(data) => {
    try {
        const email = {...data, from: 'brs.group.com@gmail.com'}
        sgMail.send(email)
        return 'Email sent'
    } catch (error) {
        throw new NotFound()
    }
}

module.exports = sendMail