const mongoose = require('mongoose')
const request = require('supertest')
require('dotenv').config()

const app = require('../../app')
const {User} = require('../../model/models/user')

const {DB_HOST} = process.env

describe('test auth', () => {
    let server
    beforeAll(() => server = app.listen(6666))
    afterAll(() => server.close())

    beforeEach((done) => {
        mongoose.connect(DB_HOST).then(() => done())
    })

    afterEach((done) => {
        mongoose.connection.db.dropCollection(() => {
            mongoose.connection.close(() => done())
        })
    })

    test('test signup route', async() => {
        const signupData = {
            email: 'kirill"gmail.com',
            password: '123456'
        }
        
        const response = await request(app).post('/api/auth/signup').send(signupData)
        
        //check response

        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe('Signup success')

        //check database

        const user = await User.findById(response.body._id)
        expect(user).toBeThruthy()
        expect(user).toBe(signupData.token)
        expect(user).toBe(signupData.email === String)
        expect(user).toBe(signupData.subscription === String)
    })
})