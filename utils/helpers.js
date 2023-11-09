const mongodb = require("../databases/mongodb");
const OrderBook = mongodb.OrderBook;
const users = mongodb.users;

exports.settleBalances = (
  sellerId,
  BuyerId,
  stockName,
  quantity,
  matchedPrice
) => {
  buyerFlag = false;
  sellerFlag = false;
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    if (element.userId == BuyerId) {
      element.balance.INR -= matchedPrice * quantity;
      if (!element.balance[stockName]) {
        element.balance[stockName] = 0;
      }
      element.balance[stockName] += quantity;
      buyerFlag = true;
    } else if (element.userId == sellerId) {
      element.balance.INR += matchedPrice * quantity;
      element.balance[stockName] -= quantity;
      sellerFlag = true;
    }
    if (buyerFlag && sellerFlag) {
      return;
    }
  }
};

exports.addToOrderBook = (type, stockName, quantity, price, userId) => {
  let orderDetails = { user_id: userId, quantity: quantity, price: price };
  OrderBook[stockName][type].push(orderDetails);
  console.log(
    `A ${type} order for ${stockName} has been added to the orderbook`
  );
};

exports.hasBalance = (userId, quantity, price) => {
  for (let i = 0; i < users.length; i++) {
    let record = users[i];
    if (record.userId == userId) {
      if (record.balance.INR < price * quantity) {
        return false;
      } else {
        return true;
      }
    }
  }
};
