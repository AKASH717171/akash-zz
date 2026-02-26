const Order = require('../models/Order');

const generateOrderNumber = async () => {
  const prefix = 'LF';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const datePrefix = `${prefix}${year}${month}`;

  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${datePrefix}` },
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  let sequenceNumber = 1;

  if (lastOrder && lastOrder.orderNumber) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-5), 10);
    if (!isNaN(lastSequence)) {
      sequenceNumber = lastSequence + 1;
    }
  }

  const orderNumber = `${datePrefix}${sequenceNumber.toString().padStart(5, '0')}`;

  const existingOrder = await Order.findOne({ orderNumber }).lean();
  if (existingOrder) {
    const randomSuffix = Math.floor(Math.random() * 900 + 100);
    return `${datePrefix}${(sequenceNumber + randomSuffix).toString().padStart(5, '0')}`;
  }

  return orderNumber;
};

module.exports = generateOrderNumber;