const express = require("express");
const app = express();
const Joi = require("joi");
const list = require("./index.js");
const slots = require("./avail_daily.js");
var resp = {};
var status = [];
const put_data = require("./put.js");
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from App Engine!");
});
app.get("/days", (req, res) => {
  respons = { success: true };
  const year = parseInt(req.query["year"]);
  let month = parseInt(req.query["month"]);

  //console.log(day.length);

  var today = new Date();

  const init_date = new Date(year, month - 1, 1, 11, 00);
  const date = new Date(year, month, 0, 11, 00);
  console.log("lastdate", date);
  console.log("firstdate", init_date);

  // this callback function is called by to fetch data based on parameters sent
  list.fet(init_date, date, function(err, res) {
    if (err) throw err;

    response(res);
  });
  //this fuction to respond the result back to callbackfunction
  function response(respons) {
    res.send(respons);
  }
});
app.get("/timeslots", (req, res) => {
  respons = { success: true };
  const year = parseInt(req.query["year"]);
  let month = parseInt(req.query["month"]);
  const day = parseInt(req.query["day"]);
  var resp = [];
  //const init_date = new Date(year, month - 1, 1, 1, 00);
  const start_time = new Date(year, month - 1, day, 09, 00, 000);
  const end_time = new Date(year, month - 1, day, 17, 00, 000);

  //console.log("start_time", start_time);
  const slot = [
    {
      id: 1,
      start_time: "09:00",
      end_time: "09:40"
    },
    {
      id: 2,
      start_time: "09:45",
      end_time: "10:25"
    },
    {
      id: 3,
      start_time: "10:30",
      end_time: "11:10"
    },
    {
      id: 4,
      start_time: "11:15",
      end_time: "11:55"
    },
    {
      id: 5,
      start_time: "12:00",
      end_time: "12:40"
    },
    {
      id: 6,
      start_time: "12:45",
      end_time: "13:25"
    },
    {
      id: 7,
      start_time: "13:30",
      end_time: "14:10"
    },
    {
      id: 8,
      start_time: "14:15",
      end_time: "14:55"
    },
    {
      id: 9,
      start_time: "15:00",
      end_time: "15:40"
    },
    {
      id: 10,
      start_time: "15:45",
      end_time: "16:25"
    },
    {
      id: 11,
      start_time: "16:30",
      end_time: "17:10"
    },
    {
      id: 12,
      start_time: "17:15",
      end_time: "17:55"
    }
  ];
  // this callback function is called by to fetch data based on parameters sent

  slots.slots(year, month, day, slot, function(err, res) {
    if (err) throw err;
    resp = { ...resp, res };
    //console.log("res", res);
    response2(resp);
  });
  function response2(respons) {
    console.log(respons);
    res.send(respons);
  } //this fuction to respond the result back to callbackfunction
});

app.post("/book", (req, res) => {
  var today = new Date();
  // Schema using joi to check conditions on the input fields to api
  const schema = {
    year: Joi.number()
      .integer()
      .required(),
    month: Joi.number()
      .min(1)
      .integer()
      .max(12)
      .required(),
    day: Joi.number()
      .integer()
      .min(1)
      .max(31)
      .required(),
    hour: Joi.number()
      .integer()
      .min(9)
      .max(17)
      .required(),
    minute: Joi.number()
      .integer()
      .min(0)
      .max(59)
      .required()
  };
  const year = parseInt(req.query["year"]);
  let month = parseInt(req.query["month"]);
  const day = parseInt(req.query["day"]);
  let hour = parseInt(req.query["hour"]);
  let minute = parseInt(req.query["minute"]);
  const result = Joi.validate(
    { year: year, month: month, day: day, hour: hour, minute: minute },
    schema
  );
  //conditions to check schema and others like current date or less than 24 hrs booking
  if (result.error) {
    res.status(400).send("invalid time slot" + result.error);
    return;
  }

  const book_date = new Date(year, month - 1, day, hour, minute, 00);
  const week = book_date.getDay();
  //console.log("day of week", week);
  const book_date1 = new Date(year, month - 1, day, hour, minute + 40, 00);
  if (week == 0 || week == 6) {
    res.status(400).send("cannot book outside bookable timeframe");
    return;
  }
  if (hour < 9 && hour >= 18) {
    res.status(400).send("cannot book outside bookable timeframe");
    return;
  }
  if (book_date < today) {
    console.log((book_date - today) / (24 * 60 * 60) / 1000);
    console.log("server_put_datesdates are past dates", book_date);
    res.status(400).send("cannot book time slot in past");
    return;
  }
  if ((book_date - today) / (24 * 60 * 60) / 1000 < 1) {
    console.log((book_date - today) / (24 * 60 * 60) / 1000);
    console.log("server_put_datesdates are past dates", book_date);
    res.status(400).send("cannot book less than 24 hours in advance ");
    return;
  }

  put_data.insert(book_date, book_date1, function(err, res) {
    // this callback function is called by lookup function with the result
    if (err) throw err;

    response1(res);
  });
  function response1(respons) {
    console.log(respons);
    res.send(respons);
  }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
