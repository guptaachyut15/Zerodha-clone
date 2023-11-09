//TODO:mongodb to be attached

exports.users= [
    {
      userId: "1",
      balance: {
        GOOGLE: 5,
        Tesla: 2,
        INR: 10000,
      },
    },
    {
      userId: "2",
      balance: {
        Tesla: 5,
        INR: 5000,
      },
    },
  ];
  
  exports.OrderBook={
    "GOOGLE":{"Sell":[{"user_id":1,"quantity":2,"price":1200}],"Buy":[]},
    "TWITTER":{"Sell":[],"Buy":[]}
  }