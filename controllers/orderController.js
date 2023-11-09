const mongodb = require("../databases/mongodb");
const {
  hasBalance,
  addToOrderBook,
  settleBalances,
} = require("../utils/helpers");
const OrderBook = mongodb.OrderBook;

exports.limitOrder = async (req, res) => {
  console.log("Limit order initiated");
  let data = req.body;
  if (
    !data.user_id ||
    !data.quantity ||
    !data.price ||
    !data.type ||
    !data.stock
  ) {
    res.status(404).send("Invalid Request data");
    return;
  }
  if (
    data.type === "Buy" &&
    !hasBalance(data.user_id, data.quantity, data.price)
  ) {
    res.status(404).send("You dont have sufficient funds");
    return;
  }

  console.log(data);
  try {
    let stockName = data.stock;
    if (!OrderBook[stockName]) {
      OrderBook[stockName] = { Sell: [], Buy: [] };
    }
    let stockOrders = OrderBook[stockName];
    console.log(stockOrders);
    let stockQuantity = data.quantity;
    if (data.type === "Buy") {
      console.log("Recieved a buy order");
      //sorting sellorders in ascending order
      let availableSellOrders = stockOrders.Sell.sort(function (a, b) {
        return a.price < b.price;
      });
      while (stockQuantity) {
        if (
          availableSellOrders[0] &&
          data.price >= availableSellOrders[0].price
        ) {
          let matchedEntry = availableSellOrders[0];
          console.log("Found one matching entry in sellorders", matchedEntry);
          settleBalances(
            matchedEntry.user_id,
            data.user_id,
            data.stock,
            matchedEntry.quantity,
            matchedEntry.price
          );
          if (stockQuantity >= matchedEntry.quantity) {
            stockQuantity = stockQuantity - matchedEntry.quantity;
            availableSellOrders.shift();
          } else {
            matchedEntry.quantity -= stockQuantity;
            stockQuantity = 0;
          }
          console.log(
            `Bought ${data.quantity - stockQuantity} at a price of ${
              matchedEntry.price
            } per share`
          );
        } else {
          console.log("No more matching records in sellorderbook");
          break;
        }
      }
    } else if (data.type == "Sell") {
      console.log("Recieved a sell order");
      //sorting sellorders in descending order
      let availableBuyOrders = stockOrders.Buy.sort(function (a, b) {
        return a.price > b.price;
      });
      while (stockQuantity) {
        if (
          availableBuyOrders[0] &&
          availableBuyOrders[0].price >= data.price
        ) {
          let matchedEntry = availableBuyOrders[0];
          console.log("Found one matching enry in buyorders", matchedEntry);
          settleBalances(
            data.user_id,
            matchedEntry.user_id,
            data.stock,
            matchedEntry.quantity,
            data.price
          );
          if (stockQuantity >= matchedEntry.quantity) {
            stockQuantity = stockQuantity - matchedEntry.quantity;
            availableBuyOrders.shift();
          } else {
            matchedEntry.quantity -= stockQuantity;
            stockQuantity = 0;
          }
          console.log(
            `Sold ${data.quantity - stockQuantity} at a price of ${
              data.price
            } per share`
          );
        } else {
          console.log("No more matching records in buyorderbook");
          break;
        }
      }
    }
    if (stockQuantity) {
      addToOrderBook(
        data.type,
        data.stock,
        stockQuantity,
        data.price,
        data.user_id
      );
      res
        .status(200)
        .send(
          `Your ${
            data.quantity - stockQuantity
          } Orders have been executed and ${stockQuantity} orders have been placed in orderbook`
        );
    } else {
      res.status(200).send("Your whole Order has been executed");
    }
  } catch (err) {
    console.log("Failed due to error", err);
    res.status(400).send("Processing failed");
  }
};
