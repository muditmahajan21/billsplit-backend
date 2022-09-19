const groupRouter = require('express').Router();
const Group = require('../models/group');
const User = require('../models/user');

groupRouter.get('/', async (request, response) => {
  try {
    const groups = await Group.find({});
    response.status(200).json({
      status: true,
      data: groups.map(group => group.toJSON())
    })
  } catch (error) {
    console.log(error);
    response.status(500).json({
      error: 'Server error'
    });
  }
})

groupRouter.get(`/:id`, async (request, response) => {
  try {
    const group = await Group.findById(request.params.id).populate('members', { id: 1, email: 1, name: 1 });
    if (group) {
      response.status(200).json({
        status: true,
        data: group.toJSON()
      });
    } else {
      response.status(404).json({
        error: 'Group not found'
      });
    }
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