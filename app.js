const express = require('express')
const logger = require("morgan");
const cors = require('cors');
const mongoose = require('mongoose')
const app = express()
const config = require('./utils/config');

const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const resetPasswordRouter = require('./controllers/resetPassword')
const updatePasswordRouter = require('./controllers/updatePassword')
const verifyEmailRouter = require('./controllers/verifyEmail')
const groupRouter = require('./controllers/groups')

const auth = require('./middleware/auth');

const url = config.MONGODB_URI
console.log('Connecting to MongoDB')

mongoose
    .connect(url)
    .then((res) => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error.message)
    })

app.use(express.json())
app.use(cors())
app.use(logger('dev'))

app.use('/login', loginRouter) 
app.use('/users', userRouter)
app.use('/reset-password', resetPasswordRouter)
app.use('/update-password', updatePasswordRouter)
app.use('/verify-email', verifyEmailRouter)

app.use(auth)
app.use('/groups', groupRouter)


app.use('*', (request, response) => {
  response.status(404).json({message: 'Not Valid Url'})
})

module.exports = app