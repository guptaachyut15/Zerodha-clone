express = require("express")

const app = express();

// interface Balances {
//   [key: string]: number;
// }
// interface User {
//   userId: string;
//   balance: Balances;
// }
const users= [
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

const OrderBook={
  "GOOGLE":{"Sell":[{"user_id":1,"quantity":2,"price":1200}],"Buy":[]},
  "TWITTER":{"Sell":[],"Buy":[]}
}
app.use(express.json()); //middleware

app.get("/", (req, res) => {
  console.log("Yayyy it got started");
  res.status(200).send("Yayy it got started");
});

//Endpoint for getting balance
app.post("/balance", (req, res) => {
  let data = req.body;
  let user_id = data.id;
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    if (element.userId === user_id) {
      let balance = element.balance;
      res.status(200).send(`Your balance is ${JSON.stringify(balance)}`);
    }
  }
});
//Endpoint for a limit order and if it needs to be added to the orderbook or it needs to get exeecuted
app.post("/limit",(req,res)=>{
  let data =req.body
  if(!data.user_id || !data.quantity || !data.price || !data.type || !data.stock){
    res.status(404).send("Invalid Request data")
    return
  }
  if (data.type==="Buy" && !hasBalance(data.user_id,data.quantity,data.price)){
    res.status(404).send("You dont have sufficient funds")
    return
  }
  
  console.log(data)
  try{
    let stockName = data.stock
    if(!OrderBook[stockName]){
      OrderBook[stockName]={"Sell":[],"Buy":[]}
    }
    let stockOrders = OrderBook[stockName]
    console.log(stockOrders)
    let stockQuantity=data.quantity
    if (data.type ==="Buy"){
      console.log("Recieved a buy order")
      //sorting sellorders in ascending order
      let availableSellOrders = stockOrders.Sell.sort(function(a,b){return a.price<b.price})
      while(stockQuantity){
        if(availableSellOrders[0] && data.price>=availableSellOrders[0].price){
          let matchedEntry=availableSellOrders[0]
          console.log("Found one matching entry in sellorders",matchedEntry)
          settleBalances(matchedEntry.user_id,data.user_id,data.stock,matchedEntry.quantity,matchedEntry.price)
          if (stockQuantity>=matchedEntry.quantity){
            stockQuantity=stockQuantity-matchedEntry.quantity
            availableSellOrders.shift()
          }else{
            matchedEntry.quantity-=stockQuantity
            stockQuantity=0
          }
          console.log(`Bought ${data.quantity-stockQuantity} at a price of ${matchedEntry.price} per share`)
        }else{
          console.log("No more matching records in sellorderbook")
          break
        }
      }
    }else if (data.type=="Sell"){
      console.log("Recieved a sell order")
      //sorting sellorders in descending order
      let availableBuyOrders = stockOrders.Buy.sort(function(a,b){return a.price>b.price})
       while(stockQuantity){
        if(availableBuyOrders[0] && availableBuyOrders[0].price>=data.price){
          let matchedEntry=availableBuyOrders[0]
          console.log("Found one matching enry in buyorders",matchedEntry)
          settleBalances(data.user_id,matchedEntry.user_id,data.stock,matchedEntry.quantity,data.price)
          if (stockQuantity>=matchedEntry.quantity){
            stockQuantity=stockQuantity-matchedEntry.quantity
            availableBuyOrders.shift()
          }else{
            matchedEntry.quantity-=stockQuantity
            stockQuantity=0
          }
          console.log(`Sold ${data.quantity-stockQuantity} at a price of ${data.price} per share`)
        }else{
          console.log("No more matching records in buyorderbook")
          break
        }
      }
    } 
    if (stockQuantity){
      addToOrderBook(data.type,data.stock,stockQuantity,data.price,data.user_id)
       res.status(200).send(`Your ${data.quantity-stockQuantity} Orders have been executed and ${stockQuantity} orders have been placed in orderbook`)
    }else{
      res.status(200).send("Your whole Order has been executed")
    }
  }catch(err){
    console.log("Failed due to error",err)
    res.status(400).send("Processing failed")
  }

})

//Endpoint for getting the orderboook
app.get("/orderbook", (req, res) => {
  res.send(OrderBook)
});

function settleBalances(sellerId,BuyerId,stockName,quantity,matchedPrice){
  buyerFlag=false
  sellerFlag=false
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    if (element.userId==BuyerId){
      element.balance.INR-=matchedPrice*quantity
      if (!element.balance[stockName]){
        element.balance[stockName]=0
      }
      element.balance[stockName]+=quantity
      buyerFlag=true
    }else if(element.userId==sellerId){
      element.balance.INR+=matchedPrice*quantity
      element.balance[stockName]-=quantity
      sellerFlag=true
    }
    if(buyerFlag && sellerFlag){
      return
    }
  }
}

function addToOrderBook(type,stockName,quantity,price,userId){
  let orderDetails={"user_id":userId,"quantity":quantity,"price":price}
  OrderBook[stockName][type].push(orderDetails)
  console.log(`A ${type} order for ${stockName} has been added to the orderbook`)
}

function hasBalance(userId,quantity,price){
  for(let i=0;i<users.length;i++){
    let record = users[i]
    if (record.userId==userId){
      if (record.balance.INR<price*quantity){
        return false
      }else{
        return true
      }
    }
  }
}

app.listen(8080, () => console.log("Listning on port 8080"));
