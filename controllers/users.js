const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const validator = require('validator');
const mailgunService = require('../services/mailgunService');

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
      return response.status(200).json({ 
        status: false,
        error: 'Name, Email, Phone Number and Password are required' 
      })
    }

    if (password.length < 3) {
      return response.status(200).json({ 
        status: false,
        error: 'Password must be at least 3 characters long' 
      })
    }

    if(!validator.isEmail(email)) {
      return response.status(200).json({ 
        status: false,
        error: 'Email is invalid' 
      })
    }

    if(!validator.isMobilePhone(phoneNumber)) {
      return response.status(200).json({ 
        status: false,
        error: 'Phone Number is invalid' 
      })
    }

    let existingUser = await User.find({ email })

    if (existingUser.length) {
      return response.status(200).json({ 
        status: false,
        error: 'User with this email already exists' 
      })
    }

    existingUser = await User.find({ phoneNumber })

    if (existingUser.length) {
      return response.status(200).json({ 
        status: false,
        error: 'User with this phone number already exists' 
      })
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

    const data = ({
      email: email,
      subject: 'Email Verification for Bill Split',
      html: `
        <h3>PLease click the link below to verify your email <\h3>
        <a href="https://billsplit-backend.cyclic.app/verify-email?id=${token}">https://billsplit-backend.cyclic.app/verify-email?id=${token}</a>
        `
    })
    
    await mailgunService(data)

    return response.status(200).json({ 
      status: true,
      data: user
    })
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