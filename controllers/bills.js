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

billRouter.post("/settle", async (request, response) => {
  try {
    const { billId, memberId } = request.body;
    const bill = await Bill.findById(billId);
    if(!bill) {
      return response.status(200).json({
        status: false,
        error: 'Bill not found',
      });
    }
    const member = bill.membersShare.find(member => member.member._id.toString() === memberId.toString());
    if(!member) {
      return response.status(200).json({
        status: false,
        error: 'Member not found',
      });
    }
    else {
      const settledMember = bill.membersSettled.find(member => member.member._id.toString() === memberId.toString());
      if(settledMember) {
        return response.status(200).json({
          status: false,
          error: 'Member already settled',
        });
      }
      else {
        bill.membersSettled.push(member);
        const paidByMember = bill.membersShare.find(member => member.member._id.toString() === bill.paidBy.toString());
        bill.membersShare.find(member => member.member._id.toString() === bill.paidBy.toString()).balance = `${Number(paidByMember.balance) + Number(member.balance)}`;
        bill.membersShare.find(member => member.member._id.toString() === memberId.toString()).balance = `0`;
      }
      if(bill.membersSettled.length === bill.membersShare.length - 1) {
        bill.isSettled = true;
      }
      await bill.save();
      response.status(200).json({
        status: true,
        data: bill,
      });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({
      error: 'Server error',
    });
  }
});

module.exports = billRouter;