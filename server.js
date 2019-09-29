const express = require("express");
const app = express();
const list = require("./index.js");

app.get("/", (req, res) => {
  res.send("Hello from App Engine!");
});
app.get("/days", (req, res) => {
  respons = { success: true };
  const year = parseInt(req.query["year"]);
  let month = parseInt(req.query["month"]);
  console.log("month is", req.query["month"]);
  var today = new Date();
  //console.log(today.getFullYear());
  const init_date = new Date(year, month, 1);
  const date = new Date(year, month, 0);
  console.log(new Date(year, month, 1));
  if (typeof month == "undefined") res.send("error");
  list.fet(init_date, date, function(err, res) {
    // this callback function is called by lookup function with the result
    if (err) throw err;

    //console.log("result is", res);
    //respons = { ...respons, res };
    response(res);
    //console.log("response from api in side is", respons);
    // res.render("index", { customerEmail: "test5@test5.com" });
  });
  //console.log("response from api is", respons);
  function response(respons) {
    res.send(respons);
  }
  //res.send(respons);
  //console.log(result);
  //if (!res)
  // res.sendStatus(400).send("This booking on this date are not available");
  // res.send("This booking on this date are not available");
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
