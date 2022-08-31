const resettPasswordRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const mailgunService = require('../services/mailgunService');

resettPasswordRouter.put('/', async (request, response) => {
  try {
    const body = request.body
    const email = body.email

    User.findOne({ email }, (error, user) => {
      if (error || !user) {
        return response.status(400).json({
          error: "No user with this email id exists"
        })
      }

      const userForToken = {
        email: user.email,
        id: user._id,
      }

      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        {
          expiresIn: "15m"
        }
      )

      const data = ({
        email,
        subject: 'Rest Password Link for Bill Split',
        html: `
          <h3> Please click the link below to reset your password <\h3>
          <a href="https://billsplit-backend.cyclic.app/update-password/${token}">Reset Password</a>
          `
      })

      return user.updateOne({ resetLink: token }, async (error, user) => {
        if (error) {
          return response.status(400).json({
            error: 'Reset password link error'
          })
        } else {
          const res = await mailgunService(data);
          console.log(res);
          return response.status(200).json({
            message: 'Reset password link sent to your email'
          })
        }
      })
    })
  } catch (error) {
    response.status(500).json({
      error: 'Server error'
    })
  }
})

module.exports = resettPasswordRouter