const billRouter = require('express').Router();
const Bill = require('../models/bill');
const User = require('../models/user');
const Group = require('../models/group');
const { calculateSplits } = require('../services/billSplitLogic');

billRouter.post("/", async (request, response) => {
  try {
    const { name, description, amount, group, paidBy } = request.body;
    const groupData = await Group.findById(group);
    if(!groupData) {
      return response.status(200).json({
        status: false,
        error: 'Group not found',
      });
    };
    const members = await User.find({ _id: { $in: groupData.members } }).lean();

    const membersShare = calculateSplits(paidBy, members, amount);

    const bill = new Bill({
      name,
      description,
      amount,
      date : Date.now(),
      group,
      paidBy,
      membersShare, 
    });

    await bill.save();
    response.status(200).json({
      status: true,
      data: bill,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      error: 'Server error',
    });
  }
});

module.exports = billRouter;