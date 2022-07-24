const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const validator = require('validator');

userRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({})
    response.json(users.map(user => user.toJSON()))
  } catch (error) {
    console.log(error)
    response.status(500).json({
      error: 'Server error'
    })
  }
})

userRouter.get('/:id', async (request, response) => {
  try {
    const user = await User.findById(request.params.id)
    response.json(user.toJSON())
  } catch (error) {
    console.log(error)
    response.status(500).json({
      error: 'Server error'
    })
  }
})

userRouter.post('/', async (request, response) => {
  try {
    const { name, password, email, phoneNumber } = request.body

    if (!name || !password || !phoneNumber|| !email) {
      return response.status(400).json({ error: 'Name, Email, Phone Number and Password are required' })
    }

    if (password.length < 3) {
      return response.status(400).json({ error: 'Password must be at least 3 characters long' })
    }

    if(!validator.isEmail(email)) {
      return response.status(400).json({ error: 'Email is invalid' })
    }

    if(!validator.isMobilePhone(phoneNumber)) {
      return response.status(400).json({ error: 'Phone Number is invalid' })
    }

    let existingUser = await User.find({ email })

    if (existingUser.length) {
      return response.status(400).json({ error: 'User with this email already exists' })
    }

    existingUser = await User.find({ phoneNumber })

    if (existingUser.length) {
      return response.status(400).json({ error: 'User with this phone number already exists' })
    }

    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await User.create({
      name,
      passwordHash,
      email,
      phoneNumber,
      token: ''
    })

    const userForToken = {
      email: user.email,
      id: user.id,
    }

    const token = jwt.sign(
      userForToken,
      process.env.SECRET,
      { expiresIn: "2h" }
    )

    user.token = token

    user.save()

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD
      }
    })

    const data = ({
      from: 'billsplit.service@gmail.com',
      to: email,
      subject: 'Email Verification for Bill Split',
      html: `
            <h3>PLease click the link below to verify your email <\h3>
            <a href="http://localhost:3001/verify-email?id=${token}">Verify Email</a>
            `
    })

    let info = transporter.sendMail(data, (error, body) => {
      if (error) {
        return response.status(400).json({
          error: error.message
        })
      }

      return response.status(200).json({
        message: 'Verification link sent successfully'
      })
    })

    response.json(user)
  } catch (error) {
    console.log(error)
    response.status(500).json({
      error: 'Server error'
    })
  }
})

userRouter.delete('/:id', async (request, response) => {
  try {
    await User.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    console.log(error)
    response.status(500).json({
      error: 'Server error'
    })
  }
})

module.exports = userRouter