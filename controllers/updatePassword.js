const updatePasswordRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

updatePasswordRouter.put('/', async (request, response) => {
  try {
    const { token, password } = request.body
    if (token) {
      jwt.verify(token, process.env.SECRET, (error, decodedData) => {
        if (error) {
          return response.status(200).json({
            status: false,
            error: 'Invalid token'
          })
        }

        User.findOne({ resetLink: token }, async (error, user) => {
          if (error || !user) {
            return response.status(200).json({
              status: false,
              error: 'User with this token does not exist'
            })
          }

          const saltRounds = 10
          const passwordHash = await bcrypt.hash(password, saltRounds)

          user.passwordHash = passwordHash

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

          user.save((error, result) => {
            if (error) {
              return response.status(200).json({
                status: false,
                error: 'Reset Password failed'
              })
            } else {
              return response.status(200).json({
                status: true,
                message: 'Your password has been changed successfully'
              })
            }
          })
        })
      })
    } else {
      response.status(200).json({
        status: false,
        error: 'Invalid token'
      })
    }
  } catch (error) {
    console.log(error)
    response.status(500).json({
      error: 'Server error'
    })
  }
})

module.exports = updatePasswordRouter