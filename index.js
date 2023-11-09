express = require("express");

const app = express();

app.use(express.json()); //middleware

app.get("/", (req, res) => {
  console.log("Yayyy it got started");
  res.status(200).send("Yayy it got started");
});

app.use("/order", require("./routes/orderRoute"));
app.use("/user", require("./routes/userRoute"));

app.listen(8080, () => console.log("Listning on port 8080"));
