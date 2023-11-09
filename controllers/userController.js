const { users } = require("../databases/mongodb");

exports.balance = async (req, res) => {
  let data = req.body;
  let user_id = data.id;
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    if (element.userId === user_id) {
      let balance = element.balance;
      res.status(200).send(`Your balance is ${JSON.stringify(balance)}`);
    }
  }
};
