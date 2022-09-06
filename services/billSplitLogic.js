const calculateSplits = (paidBy, members, amount) => {  
  const splittedBill = +Number( amount / members.length ).toFixed(2);
  const membersShare = members.map(member => {
    if(member._id.toString() === paidBy.toString()) {
      return {
        member,
        balance: `${Number(amount - splittedBill).toFixed(2)}`,
      }
    } else {
      return {
        member,
        balance: `-${Number(splittedBill).toFixed(2)}`,
      }
    }
  });
  return membersShare;
}

module.exports = {
  calculateSplits,
};