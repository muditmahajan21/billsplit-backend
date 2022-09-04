const groupRouter = require('express').Router();
const Group = require('../models/group');
const User = require('../models/user');
const validator = require('validator');

groupRouter.post('/', async (request, response) => {
  try {
    const { name, description, members } = request.body;
    
    const group = await Group.create({
      name,
      description,
      members,
    });

    group.save();

    response.status(200).json({
      status: true,
      data: group,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      error: 'Server error',
    });
  }
})

module.exports = groupRouter;