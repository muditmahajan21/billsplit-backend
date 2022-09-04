const groupRouter = require('express').Router();
const Group = require('../models/group');
const User = require('../models/user');
const validator = require('validator');

groupRouter.get('/', async (request, response) => {
  try {
    const groups = await Group.find({});
    response.json(groups.map(group => group.toJSON()));
  } catch (error) {
    console.log(error);
    response.status(500).json({
      error: 'Server error'
    });
  }
})

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

groupRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;
  const group = await Group.findById(id);
  if(!group) {
    return response.status(200).json({
      status: false,
      error: 'Group not found',
    });
  } else {
    const deletedGroup = await Group.findByIdAndDelete(id);
    return response.status(200).json({
      status: true,
      data: deletedGroup,
    });
  }
})

module.exports = groupRouter;